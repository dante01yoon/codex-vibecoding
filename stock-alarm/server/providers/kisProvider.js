import { missingConfig } from "../config/env.js";

export const kisProvider = {
  id: "kis",
  label: "Korea Investment Open API",

  async searchSymbols() {
    throw providerError(
      "KIS_SEARCH_NOT_IMPLEMENTED",
      "KIS symbol search is not wired yet. Use exact KRX codes for quotes.",
      501,
    );
  },

  async getQuotes({ env, symbols = [] } = {}) {
    ensureKisConfigured(env);
    const uniqueSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
    const quotes = await Promise.all(
      uniqueSymbols.map((symbol) => requestKisQuote({ env, symbol })),
    );

    return quotes;
  },

  async getHistory() {
    throw providerError(
      "KIS_HISTORY_NOT_IMPLEMENTED",
      "KIS daily history adapter is reserved for the next provider task.",
      501,
    );
  },

  async getMarketStatus() {
    return {
      market: "KR",
      provider: "Korea Investment Open API",
      isOpen: null,
      status: "Provider configured",
      timestamp: new Date().toISOString(),
      isSample: false,
    };
  },
};

async function requestKisQuote({ env, symbol }) {
  const url = new URL("/uapi/domestic-stock/v1/quotations/inquire-price", env.kisBaseUrl);
  url.searchParams.set("FID_COND_MRKT_DIV_CODE", "J");
  url.searchParams.set("FID_INPUT_ISCD", symbol);

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${env.kisAccessToken}`,
      appkey: env.kisAppKey,
      appsecret: env.kisAppSecret,
      custtype: "P",
      tr_id: "FHKST01010100",
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw providerError("KIS_HTTP_ERROR", "KIS quote request failed.", 502);
  }

  if (payload.rt_cd && payload.rt_cd !== "0") {
    throw providerError("KIS_API_ERROR", payload.msg1 ?? "KIS API returned an error.", 502);
  }

  const output = payload.output ?? {};
  const price = Number(output.stck_prpr);
  const change = Number(output.prdy_vrss);
  const changePercent = Number(output.prdy_ctrt);
  const previousClose =
    Number.isFinite(price) && Number.isFinite(change) ? price - change : Number(output.stck_sdpr);

  return {
    symbol,
    displayName: symbol,
    market: "KR",
    exchange: "KRX",
    currency: "KRW",
    provider: "Korea Investment Open API",
    price,
    change,
    changePercent,
    previousClose,
    timestamp: new Date().toISOString(),
    updatedAt: "KIS latest quote",
    isSample: false,
    isDelayed: false,
    marketStatus: "KIS latest quote",
  };
}

function ensureKisConfigured(env) {
  if (!env.kisAppKey || !env.kisAppSecret || !env.kisAccessToken) {
    throw missingConfig(
      "KIS_APP_KEY, KIS_APP_SECRET, and KIS_ACCESS_TOKEN are required for KIS quotes.",
      "kis",
    );
  }
}

function normalizeSymbol(value) {
  return String(value ?? "").trim().toUpperCase();
}

function providerError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.provider = "kis";
  return error;
}
