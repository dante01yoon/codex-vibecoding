import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { createReadStream, promises as fs } from 'node:fs';

import type {
  EnvironmentInfo,
  SessionDetail,
  SessionMessage,
  SessionSummary,
} from '../shared/contracts';

interface SessionIndexEntry {
  id: string;
  thread_name?: string;
  updated_at?: string;
}

interface ParsedSessionMeta {
  id?: string;
  cwd?: string;
  startedAt?: string;
}

const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const SESSION_ROOT = path.join(CODEX_HOME, 'sessions');
const SESSION_INDEX_PATH = path.join(CODEX_HOME, 'session_index.jsonl');
const SESSION_ID_PATTERN =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl$/i;

let sessionFileLookup = new Map<string, string>();
let sessionSummaryCache = new Map<string, SessionSummary>();

export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    codexHome: CODEX_HOME,
    sessionRoot: SESSION_ROOT,
    sessionIndexPath: SESSION_INDEX_PATH,
    platform: process.platform,
  };
}

export async function loadSessionSummaries(): Promise<SessionSummary[]> {
  const [sessionFiles, sessionIndex] = await Promise.all([
    findSessionFiles(SESSION_ROOT),
    readSessionIndex(),
  ]);

  const nextLookup = new Map<string, string>();
  const nextCache = new Map<string, SessionSummary>();
  const summaries: SessionSummary[] = [];

  for (const filePath of sessionFiles) {
    const fallbackId = extractSessionIdFromFile(filePath);
    const summary = await summarizeSessionFile(filePath, sessionIndex.get(fallbackId ?? ''));
    if (!summary) {
      continue;
    }

    nextLookup.set(summary.id, filePath);
    nextCache.set(summary.id, summary);
    summaries.push(summary);
  }

  summaries.sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );

  sessionFileLookup = nextLookup;
  sessionSummaryCache = nextCache;

  return summaries;
}

export async function loadSessionDetail(sessionId: string): Promise<SessionDetail> {
  const summary =
    sessionSummaryCache.get(sessionId) ||
    (await rebuildSummaryFromSessionId(sessionId));
  const filePath = sessionFileLookup.get(sessionId) || summary?.filePath;

  if (!summary || !filePath) {
    throw new Error(`Session ${sessionId} was not found in ${SESSION_ROOT}.`);
  }

  const parsed = await parseSessionFile(filePath, { maxMessages: Number.POSITIVE_INFINITY });
  const counts = parsed.messages.reduce(
    (accumulator, message) => {
      accumulator[message.role] += 1;
      accumulator.total += 1;
      return accumulator;
    },
    { user: 0, assistant: 0, total: 0 },
  );

  return {
    ...summary,
    cwd: summary.cwd || parsed.meta.cwd,
    startedAt: summary.startedAt || parsed.meta.startedAt,
    messageCount: counts,
    openingMessages: parsed.messages.slice(0, 8),
    recentMessages: parsed.messages.slice(-8),
  };
}

export async function getSessionSummary(sessionId: string): Promise<SessionSummary | undefined> {
  return sessionSummaryCache.get(sessionId) || rebuildSummaryFromSessionId(sessionId);
}

async function rebuildSummaryFromSessionId(
  sessionId: string,
): Promise<SessionSummary | undefined> {
  const [filePath, sessionIndex] = await Promise.all([
    findSessionFileById(sessionId),
    readSessionIndex(),
  ]);

  if (!filePath) {
    return undefined;
  }

  const summary = await summarizeSessionFile(filePath, sessionIndex.get(sessionId));
  if (summary) {
    sessionFileLookup.set(summary.id, filePath);
    sessionSummaryCache.set(summary.id, summary);
  }

  return summary;
}

async function summarizeSessionFile(
  filePath: string,
  sessionIndexEntry?: SessionIndexEntry,
): Promise<SessionSummary | undefined> {
  const parsed = await parseSessionFile(filePath, { maxMessages: 6 });
  const stats = await fs.stat(filePath);
  const id = parsed.meta.id || sessionIndexEntry?.id || extractSessionIdFromFile(filePath);

  if (!id) {
    return undefined;
  }

  const firstUserMessage = parsed.messages.find((message) => message.role === 'user');
  const previewSeed =
    firstUserMessage?.text ||
    parsed.messages[0]?.text ||
    sessionIndexEntry?.thread_name ||
    `Session ${id.slice(0, 8)}`;
  const titleSeed = sessionIndexEntry?.thread_name || firstUserMessage?.text || previewSeed;

  return {
    id,
    title: clip(titleSeed, 72),
    preview: clip(previewSeed, 180),
    updatedAt:
      sessionIndexEntry?.updated_at ||
      stats.mtime.toISOString(),
    startedAt: parsed.meta.startedAt,
    cwd: parsed.meta.cwd,
    filePath,
    snippets: parsed.messages.slice(0, 4),
  };
}

async function parseSessionFile(
  filePath: string,
  options: { maxMessages: number },
): Promise<{ meta: ParsedSessionMeta; messages: SessionMessage[] }> {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const lineReader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const meta: ParsedSessionMeta = {};
  const messages: SessionMessage[] = [];

  try {
    for await (const line of lineReader) {
      if (!line.trim()) {
        continue;
      }

      let record: Record<string, any>;
      try {
        record = JSON.parse(line);
      } catch {
        continue;
      }

      if (record.type === 'session_meta') {
        meta.id = record.payload?.id || meta.id;
        meta.cwd = record.payload?.cwd || meta.cwd;
        meta.startedAt = record.payload?.timestamp || meta.startedAt;
      }

      const extractedMessages = extractMessages(record);
      for (const message of extractedMessages) {
        const cleanedText = sanitizeConversationText(message.text);
        if (!cleanedText) {
          continue;
        }

        const normalizedMessage: SessionMessage = {
          ...message,
          text: cleanedText,
        };

        const previousMessage = messages[messages.length - 1];
        if (
          previousMessage &&
          previousMessage.role === normalizedMessage.role &&
          previousMessage.text === normalizedMessage.text
        ) {
          continue;
        }

        messages.push(normalizedMessage);
        if (messages.length >= options.maxMessages) {
          lineReader.close();
          break;
        }
      }
    }
  } finally {
    lineReader.close();
    stream.close();
  }

  return { meta, messages };
}

function extractMessages(record: Record<string, any>): SessionMessage[] {
  if (record.type === 'event_msg') {
    if (record.payload?.type === 'user_message') {
      return [
        {
          role: 'user',
          text: record.payload.message,
          timestamp: record.timestamp,
          phase: 'request',
        },
      ];
    }

    if (record.payload?.type === 'agent_message') {
      return [
        {
          role: 'assistant',
          text: record.payload.message,
          timestamp: record.timestamp,
          phase: record.payload.phase,
        },
      ];
    }
  }

  if (
    record.type === 'response_item' &&
    record.payload?.type === 'message' &&
    (record.payload?.role === 'user' || record.payload?.role === 'assistant')
  ) {
    const text = Array.isArray(record.payload?.content)
      ? record.payload.content
          .map((item: Record<string, any>) => item.text || '')
          .join('\n')
      : '';

    return [
      {
        role: record.payload.role,
        text,
        timestamp: record.timestamp,
        phase: record.payload.phase,
      },
    ];
  }

  return [];
}

function sanitizeConversationText(rawText: string | undefined): string {
  if (!rawText) {
    return '';
  }

  const withoutEnvironment = rawText.replace(
    /<environment_context>[\s\S]*?<\/environment_context>/gi,
    ' ',
  );
  const compact = withoutEnvironment
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!compact || compact.startsWith('<environment_context>')) {
    return '';
  }

  return compact;
}

async function readSessionIndex(): Promise<Map<string, SessionIndexEntry>> {
  const index = new Map<string, SessionIndexEntry>();

  try {
    const rawIndex = await fs.readFile(SESSION_INDEX_PATH, 'utf8');
    for (const line of rawIndex.split('\n')) {
      if (!line.trim()) {
        continue;
      }

      try {
        const item = JSON.parse(line) as SessionIndexEntry;
        if (item.id) {
          index.set(item.id, item);
        }
      } catch {
        continue;
      }
    }
  } catch {
    return index;
  }

  return index;
}

async function findSessionFiles(rootDirectory: string): Promise<string[]> {
  const files: string[] = [];
  const directories = [rootDirectory];

  while (directories.length > 0) {
    const currentDirectory = directories.pop();
    if (!currentDirectory) {
      continue;
    }

    let entries;
    try {
      entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        directories.push(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

async function findSessionFileById(sessionId: string): Promise<string | undefined> {
  const sessionFiles = await findSessionFiles(SESSION_ROOT);
  return sessionFiles.find((filePath) => extractSessionIdFromFile(filePath) === sessionId);
}

function extractSessionIdFromFile(filePath: string): string | undefined {
  return path.basename(filePath).match(SESSION_ID_PATTERN)?.[1];
}

function clip(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 1).trimEnd()}…`;
}
