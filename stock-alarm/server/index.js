import express from "express";

import { getServerEnv } from "./config/env.js";
import { getProvider, listProviders } from "./providers/providerRegistry.js";
import { demoProvider } from "./providers/demoProvider.js";

const app = express();
const env = getServerEnv();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    providerConfig: {
      alphaVantage: Boolean(env.alphaVantageApiKey),
      kis: Boolean(env.kisAppKey && env.kisAppSecret && env.kisAccessToken),
    },
    providers: listProviders(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/search", asyncHandler(async (request, response) => {
  const market = String(request.query.market ?? "All");
  const providerId = String(request.query.provider ?? "demo");
  const provider = getProvider(providerId, market);
  const query = String(request.query.query ?? "");
  const result = await withAutoFallback({
    fallback: () => demoProvider.searchSymbols({ market, query }),
    provider,
    providerId,
    request: () => provider.searchSymbols({ env, market, query }),
  });

  sendData(response, result.provider, result.data, result);
}));

app.get("/api/quotes", asyncHandler(async (request, response) => {
  const market = String(request.query.market ?? "US");
  const providerId = String(request.query.provider ?? "demo");
  const provider = getProvider(providerId, market);
  const symbols = String(request.query.symbols ?? "")
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);
  const result = await withAutoFallback({
    fallback: () => demoProvider.getQuotes({ market, symbols }),
    provider,
    providerId,
    request: () => provider.getQuotes({ env, market, symbols }),
  });

  sendData(response, result.provider, result.data, result);
}));

app.get("/api/history", asyncHandler(async (request, response) => {
  const market = String(request.query.market ?? "US");
  const providerId = String(request.query.provider ?? "demo");
  const provider = getProvider(providerId, market);
  const range = String(request.query.range ?? "1M");
  const symbol = String(request.query.symbol ?? "");
  const result = await withAutoFallback({
    fallback: () => demoProvider.getHistory({ range, symbol }),
    provider,
    providerId,
    request: () => provider.getHistory({ env, market, range, symbol }),
  });

  sendData(response, result.provider, result.data, result);
}));

app.get("/api/market-status", asyncHandler(async (request, response) => {
  const market = String(request.query.market ?? "US");
  const providerId = String(request.query.provider ?? "demo");
  const provider = getProvider(providerId, market);
  const result = await withAutoFallback({
    fallback: () => demoProvider.getMarketStatus({ market }),
    provider,
    providerId,
    request: () => provider.getMarketStatus({ env, market }),
  });

  sendData(response, result.provider, result.data, result);
}));

app.use((error, _request, response, _next) => {
  const status = error.status ?? 500;

  response.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_SERVER_ERROR",
      message: error.message ?? "Unexpected API error.",
      provider: error.provider ?? "unknown",
    },
    providerStatus: {
      provider: error.provider ?? "unknown",
      state: status === 503 ? "setup_required" : "error",
    },
  });
});

app.listen(env.port, env.host, () => {
  console.log(`Stock Alarm API listening on http://${env.host}:${env.port}`);
});

async function withAutoFallback({ fallback, provider, providerId, request }) {
  try {
    return {
      data: await request(),
      error: null,
      fallback: false,
      provider,
    };
  } catch (error) {
    if (providerId !== "auto") {
      throw error;
    }

    return {
      data: await fallback(),
      error,
      fallback: true,
      provider: demoProvider,
    };
  }
}

function sendData(response, provider, data, result = {}) {
  response.json({
    data,
    providerStatus: {
      fallbackReason: result.error?.code,
      provider: provider.id,
      label: provider.label,
      state: result.fallback ? "fallback" : "ok",
    },
  });
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
