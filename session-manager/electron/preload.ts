import { contextBridge, ipcRenderer } from 'electron';

import type { SessionManagerApi } from '../shared/contracts';

const api: SessionManagerApi = {
  listSessions: () => ipcRenderer.invoke('sessions:list'),
  getSessionDetail: (sessionId) => ipcRenderer.invoke('sessions:detail', sessionId),
  resumeSession: (sessionId) => ipcRenderer.invoke('sessions:resume', sessionId),
  getEnvironment: () => ipcRenderer.invoke('sessions:environment'),
};

contextBridge.exposeInMainWorld('sessionManager', api);
