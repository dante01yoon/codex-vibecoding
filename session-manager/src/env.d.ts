/// <reference types="vite/client" />

import type { SessionManagerApi } from '../shared/contracts';

declare global {
  interface Window {
    sessionManager: SessionManagerApi;
  }
}

export {};
