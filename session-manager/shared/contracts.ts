export type SessionRole = 'user' | 'assistant';

export interface SessionMessage {
  role: SessionRole;
  text: string;
  timestamp?: string;
  phase?: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  startedAt?: string;
  cwd?: string;
  filePath: string;
  snippets: SessionMessage[];
}

export interface SessionDetail extends SessionSummary {
  openingMessages: SessionMessage[];
  recentMessages: SessionMessage[];
  messageCount: {
    user: number;
    assistant: number;
    total: number;
  };
}

export interface ResumeResult {
  ok: boolean;
  message: string;
}

export interface EnvironmentInfo {
  codexHome: string;
  sessionRoot: string;
  sessionIndexPath: string;
  platform: NodeJS.Platform;
}

export interface SessionManagerApi {
  listSessions(): Promise<SessionSummary[]>;
  getSessionDetail(sessionId: string): Promise<SessionDetail>;
  resumeSession(sessionId: string): Promise<ResumeResult>;
  getEnvironment(): Promise<EnvironmentInfo>;
}
