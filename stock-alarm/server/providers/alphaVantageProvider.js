import { missingConfig } from "../config/env.js";

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";

export const alphaVantageProvider = {
  id: "alpha-vantage",
  label: "Alpha Vantage",

  async searchSymbols({ env, market = "US", query = "" } = {}) {
    const payload = await requestAlphaVantage(
      {
        function: "SYMBOL_SEARCH",
        keywords: query || market,
      },
      env,
    );

    return (payload.bestMatches ?? []).map((match) => ({
      symbol: match["1. symbol"],
      displayName: match["2. name"],
      exchange: match["4. region"] ?? "US",
      market: normalizeAlphaMarket(match["4. region"], market),
      currency: match["8. currency"] ?? "USD",
      provider: "Alpha Vantage",
    }));
  },

  async getQuotes({ env, symbols = [] } = {}) {
    const uniqueSymbols = [...new Set(symbols.map(normalizeSymbol).filter(Boolean))];
    const quotes = await Promise.all(
      uniqueSymbols.map(async (symbol) => {
        const payload = await requestAlphaVantage(
          {
            function: "GLOBAL_QUOTE",
            symbol,
          },
          env,
        );

        return normalizeAlphaQuote(payload["Global Quote"], symbol);
      }),
    );

    return quotes.filter(Boolean);
  },

  async getHistory({ env, range = "1M", symbol } = {}) {
    const payload = await requestAlphaVantage(
      {
        function: "TIME_SERIES_DAILY",
        outputsize: "compact",
        symbol: normalizeSymbol(symbol),
      },
      env,
    );
    const series = payload["Time Series (Daily)"] ?? {};

    return {
      symbol: normalizeSymbol(symbol),
      range,
      provider: "Alpha Vantage",
      isSample: false,
      bars: Object.entries(series)
        .slice(0, historyLimitForRange(range))
        .reverse()
        .map(([time, values]) => ({
          time,
          open: Number(values["1. open"]),
          high: Number(values["2. high"]),
          low: Number(values["3. low"]),
          close: Number(values["4. close"]),
          volume: Number(values["5. volume"]),
        })),
    };
  },

  async getMarketStatus({ env, market = "US" } = {}) {
    const payload = await requestAlphaVantage({ function: "MARKET_STATUS" }, env);
    const markets = payload.markets ?? [];
    const normalizedMarket = market === "KR" ? "South Korea" : "United States";
    const match = markets.find((item) =>
      String(item.region ?? "").toLowerCase().includes(normalizedMarket.toLowerCase()),
    );

    return {
      market,
      provider: "Alpha Vantage",
      isOpen: match?.current_status === "open",
      status: match?.current_status ?? "unknown",
      timestamp: new Date().toISOString(),
      isSample: false,
    };
  },
};

async function requestAlphaVantage(params, env) {
  if (!env.alphaVantageApiKey) {
    throw missingConfig("ALPHA_VANTAGE_API_KEY is not configured.", "alpha-vantage");
  }

  const url = new URL(ALPHA_VANTAGE_URL);
  Object.entries({ ...params, apikey: env.alphaVantageApiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw providerError("ALPHA_VANTAGE_HTTP_ERROR", "Alpha Vantage request failed.", 502);
  }

  if (payload["Error Message"]) {
    throw providerError("ALPHA_VANTAGE_BAD_REQUEST", payload["Error Message"], 400);
  }

  if (payload.Note || payload.Information) {
    throw providerError(
      "ALPHA_VANTAGE_LIMITED",
      payload.Note ?? payload.Information,
      payload.Note ? 429 : 503,
    );
  }

  return payload;
}

function normalizeAlphaQuote(rawQuote, requestedSymbol) {
  if (!rawQuote || Object.keys(rawQuote).length === 0) {
    return null;
  }

  const symbol = rawQuote["01. symbol"] ?? requestedSymbol;
  const latestTradingDay = rawQuote["07. latest trading day"];

  return {
    symbol,
    displayName: symbol,
    market: "US",
    exchange: "Alpha Vantage",
    currency: "USD",
    provider: "Alpha Vantage",
    price: Number(rawQuote["05. price"]),
    change: Number(rawQuote["09. change"]),
    changePercent: Number(String(rawQuote["10. change percent"] ?? "").replace("%", "")),
    previousClose: Number(rawQuote["08. previous close"]),
    timestamp: latestTradingDay ? `${latestTradingDay}T21:00:00.000Z` : new Date().toISOString(),
    updatedAt: latestTradingDay ?? "Latest provider quote",
    isSample: false,
    isDelayed: true,
    marketStatus: "Latest provider quote",
  };
}

function normalizeAlphaMarket(region, fallbackMarket) {
  const normalizedRegion = String(region ?? "").toLowerCase();

  if (normalizedRegion.includes("korea")) {
    return "KR";
  }

  if (normalizedRegion.includes("united states")) {
    return "US";
  }

  return fallbackMarket === "KR" ? "KR" : "US";
}

function normalizeSymbol(value) {
  return String(value ?? "").trim().toUpperCase();
}

function historyLimitForRange(range) {
  const limits = {
    "1D": 2,
    "1W": 7,
    "1M": 22,
    "6M": 126,
    "1Y": 252,
  };

  return limits[range] ?? limits["1M"];
}

function providerError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.provider = "alpha-vantage";
  return error;
}
