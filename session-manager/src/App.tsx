import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';

import type {
  EnvironmentInfo,
  ResumeResult,
  SessionDetail,
  SessionSummary,
} from '../shared/contracts';

type StatusTone = 'neutral' | 'success' | 'error';

interface StatusMessage {
  tone: StatusTone;
  text: string;
}

function formatAbsoluteDate(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatRelativeDate(value?: string): string {
  if (!value) {
    return 'unknown';
  }

  const timestamp = new Date(value).getTime();
  const diff = timestamp - Date.now();
  const formatter = new Intl.RelativeTimeFormat('ko-KR', { numeric: 'auto' });
  const units = [
    { label: 'year', size: 1000 * 60 * 60 * 24 * 365 },
    { label: 'month', size: 1000 * 60 * 60 * 24 * 30 },
    { label: 'day', size: 1000 * 60 * 60 * 24 },
    { label: 'hour', size: 1000 * 60 * 60 },
    { label: 'minute', size: 1000 * 60 },
  ] as const;

  for (const unit of units) {
    if (Math.abs(diff) >= unit.size) {
      return formatter.format(Math.round(diff / unit.size), unit.label);
    }
  }

  return '방금 전';
}

function shortenPath(value?: string): string {
  if (!value) {
    return 'No working directory';
  }

  const normalized = value.replace(/\\/g, '/');
  const parts = normalized.split('/');

  if (parts.length <= 4) {
    return normalized;
  }

  return `…/${parts.slice(-4).join('/')}`;
}

function filterSessions(sessions: SessionSummary[], query: string): SessionSummary[] {
  if (!query.trim()) {
    return sessions;
  }

  const normalizedQuery = query.toLowerCase();
  return sessions.filter((session) =>
    [session.title, session.preview, session.cwd || '', session.id]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function statusTextFromError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}

export function App() {
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [details, setDetails] = useState<Record<string, SessionDetail>>({});
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusMessage>({
    tone: 'neutral',
    text: 'Arrow keys or J/K move. Enter resumes the selected Codex session.',
  });
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const deferredQuery = useDeferredValue(query);
  const filteredSessions = filterSessions(sessions, deferredQuery);
  const selectedSession =
    filteredSessions.find((session) => session.id === selectedId) ||
    filteredSessions[0] ||
    null;
  const selectedDetail = selectedSession ? details[selectedSession.id] : undefined;

  async function refreshSessions() {
    setIsLoadingSessions(true);

    try {
      const [nextEnvironment, nextSessions] = await Promise.all([
        window.sessionManager.getEnvironment(),
        window.sessionManager.listSessions(),
      ]);

      startTransition(() => {
        setEnvironment(nextEnvironment);
        setSessions(nextSessions);
        setSelectedId((currentId) => {
          if (currentId && nextSessions.some((session) => session.id === currentId)) {
            return currentId;
          }

          return nextSessions[0]?.id || null;
        });
      });

      setStatus({
        tone: 'neutral',
        text: `Loaded ${nextSessions.length} sessions from ${shortenPath(
          nextEnvironment.sessionRoot,
        )}.`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: statusTextFromError(error),
      });
    } finally {
      setIsLoadingSessions(false);
    }
  }

  useEffect(() => {
    void refreshSessions();
  }, []);

  useEffect(() => {
    if (!selectedSession || details[selectedSession.id]) {
      return;
    }

    let cancelled = false;
    setIsLoadingDetail(true);

    void window.sessionManager
      .getSessionDetail(selectedSession.id)
      .then((detail) => {
        if (cancelled) {
          return;
        }

        setDetails((currentDetails) => ({
          ...currentDetails,
          [detail.id]: detail,
        }));
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setStatus({
          tone: 'error',
          text: statusTextFromError(error),
        });
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [details, selectedSession]);

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      itemRefs.current[selectedSession.id]?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedSession]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && document.activeElement !== searchInputRef.current) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        void refreshSessions();
        return;
      }

      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setQuery('');
        searchInputRef.current?.blur();
        return;
      }

      if (!filteredSessions.length) {
        return;
      }

      const currentIndex = filteredSessions.findIndex(
        (session) => session.id === selectedSession?.id,
      );
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;

      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 'j') {
        event.preventDefault();
        const nextIndex = Math.min(filteredSessions.length - 1, safeIndex + 1);
        setSelectedId(filteredSessions[nextIndex]?.id || null);
        return;
      }

      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const nextIndex = Math.max(0, safeIndex - 1);
        setSelectedId(filteredSessions[nextIndex]?.id || null);
        return;
      }

      if (
        event.key === 'Enter' &&
        document.activeElement !== searchInputRef.current &&
        selectedSession &&
        !isLaunching
      ) {
        event.preventDefault();
        void handleResume(selectedSession.id);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filteredSessions, isLaunching, selectedSession]);

  async function handleResume(sessionId: string) {
    setIsLaunching(true);
    try {
      const result: ResumeResult = await window.sessionManager.resumeSession(sessionId);
      setStatus({
        tone: 'success',
        text: result.message,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        text: statusTextFromError(error),
      });
    } finally {
      setIsLaunching(false);
    }
  }

  const openingMessages = selectedDetail?.openingMessages || selectedSession?.snippets || [];
  const recentMessages = selectedDetail?.recentMessages || selectedSession?.snippets || [];

  return (
    <div className="app-shell">
      <div className="background-grid" />
      <header className="topbar">
        <div className="title-block">
          <p className="eyebrow">Archive Desk</p>
          <h1>Codex Session Manager</h1>
          <p className="lede">
            저장된 Codex 세션을 목록으로 훑고, 내용을 빠르게 미리 본 뒤 바로 이어서
            실행할 수 있는 데스크톱 브라우저.
          </p>
        </div>
        <div className="action-block">
          <button
            className="secondary-button"
            type="button"
            onClick={() => void refreshSessions()}
            disabled={isLoadingSessions}
          >
            {isLoadingSessions ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => selectedSession && void handleResume(selectedSession.id)}
            disabled={!selectedSession || isLaunching}
          >
            {isLaunching ? 'Launching…' : 'Resume Session'}
          </button>
        </div>
      </header>

      <section className="dashboard-strip">
        <div className="dashboard-card">
          <span className="dashboard-label">세션 저장소</span>
          <strong>{shortenPath(environment?.sessionRoot)}</strong>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-label">인덱스 파일</span>
          <strong>{shortenPath(environment?.sessionIndexPath)}</strong>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-label">로컬 세션 수</span>
          <strong>{sessions.length.toLocaleString('ko-KR')}</strong>
        </div>
      </section>

      <main className="workspace-grid">
        <aside className="session-list-panel">
          <div className="search-card">
            <label className="search-label" htmlFor="session-search">
              세션 검색
            </label>
            <input
              id="session-search"
              ref={searchInputRef}
              className="search-input"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 미리보기, 경로, 세션 ID"
            />
            <p className="search-hint">
              <kbd>/</kbd> 검색 포커스, <kbd>Esc</kbd> 입력 해제, <kbd>Ctrl/Cmd + R</kbd>{' '}
              새로고침
            </p>
          </div>

          <div className="list-header">
            <span>Session Archive</span>
            <span>{filteredSessions.length}</span>
          </div>

          <div className="session-list" role="list">
            {filteredSessions.map((session) => {
              const isSelected = session.id === selectedSession?.id;
              return (
                <button
                  className={`session-card ${isSelected ? 'is-selected' : ''}`}
                  key={session.id}
                  type="button"
                  ref={(element) => {
                    itemRefs.current[session.id] = element;
                  }}
                  onClick={() => setSelectedId(session.id)}
                  onDoubleClick={() => void handleResume(session.id)}
                >
                  <div className="session-card-header">
                    <p className="session-title">{session.title}</p>
                    <span className="session-updated">{formatRelativeDate(session.updatedAt)}</span>
                  </div>
                  <p className="session-preview">{session.preview}</p>
                  <div className="session-meta-row">
                    <span>{shortenPath(session.cwd)}</span>
                    <span>{session.id.slice(0, 8)}</span>
                  </div>
                </button>
              );
            })}

            {!isLoadingSessions && filteredSessions.length === 0 ? (
              <div className="empty-state">
                <p>조건에 맞는 세션이 없습니다.</p>
                <span>검색어를 비우거나 `~/.codex/sessions` 경로를 확인하세요.</span>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="detail-panel">
          {selectedSession ? (
            <>
              <div className="detail-hero">
                <div>
                  <p className="eyebrow">Selected Session</p>
                  <h2>{selectedSession.title}</h2>
                  <p className="detail-preview">{selectedSession.preview}</p>
                </div>
                <div className="detail-actions">
                  <span className="detail-pill">{formatRelativeDate(selectedSession.updatedAt)}</span>
                  <span className="detail-pill">
                    {selectedDetail?.messageCount.total || selectedSession.snippets.length} snippets
                  </span>
                </div>
              </div>

              <div className="detail-metadata">
                <div className="metadata-card">
                  <span>Updated</span>
                  <strong>{formatAbsoluteDate(selectedSession.updatedAt)}</strong>
                </div>
                <div className="metadata-card">
                  <span>Started</span>
                  <strong>{formatAbsoluteDate(selectedSession.startedAt)}</strong>
                </div>
                <div className="metadata-card">
                  <span>Working Directory</span>
                  <strong>{shortenPath(selectedSession.cwd)}</strong>
                </div>
                <div className="metadata-card">
                  <span>Session ID</span>
                  <strong>{selectedSession.id}</strong>
                </div>
              </div>

              <div className="conversation-grid">
                <section className="conversation-panel">
                  <div className="conversation-panel-header">
                    <h3>대화 시작</h3>
                    <span>첫 흐름을 빠르게 확인</span>
                  </div>
                  <div className="conversation-stack">
                    {openingMessages.map((message, index) => (
                      <article className="message-card" key={`${message.role}-${index}`}>
                        <div className="message-card-header">
                          <span className={`message-badge ${message.role}`}>{message.role}</span>
                          <span>{formatAbsoluteDate(message.timestamp)}</span>
                        </div>
                        <p>{message.text}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="conversation-panel">
                  <div className="conversation-panel-header">
                    <h3>최근 메시지</h3>
                    <span>세션의 최신 흐름</span>
                  </div>
                  <div className="conversation-stack">
                    {recentMessages.map((message, index) => (
                      <article className="message-card" key={`${message.role}-recent-${index}`}>
                        <div className="message-card-header">
                          <span className={`message-badge ${message.role}`}>{message.role}</span>
                          <span>{formatAbsoluteDate(message.timestamp)}</span>
                        </div>
                        <p>{message.text}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="footer-strip">
                <div>
                  <span className="footer-label">Session file</span>
                  <strong>{selectedSession.filePath}</strong>
                </div>
                <div>
                  <span className="footer-label">Status</span>
                  <strong>{isLoadingDetail ? 'Detail loading…' : status.text}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <h2>세션을 선택하세요</h2>
              <p>
                왼쪽 목록에서 세션을 선택하면 첫 요청과 최근 대화 흐름을 미리 볼 수
                있습니다.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className={`status-bar status-${status.tone}`}>
        <span>{status.text}</span>
        <span className="status-platform">{environment?.platform || 'unknown platform'}</span>
      </footer>
    </div>
  );
}
