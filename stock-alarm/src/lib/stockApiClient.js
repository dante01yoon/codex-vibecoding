const API_BASE_URL = import.meta.env.VITE_STOCK_API_BASE_URL ?? "";

export async function fetchApiHealth() {
  return requestStockApi("/api/health");
}

export async function searchSymbols({ market = "All", provider = "demo", query = "" } = {}) {
  return requestStockApi("/api/search", { market, provider, query });
}

export async function fetchQuotes({ market = "US", provider = "demo", symbols = [] } = {}) {
  return requestStockApi("/api/quotes", {
    market,
    provider,
    symbols: symbols.join(","),
  });
}

export async function fetchHistory({ market = "US", provider = "demo", range = "1M", symbol } = {}) {
  return requestStockApi("/api/history", {
    market,
    provider,
    range,
    symbol,
  });
}

export async function fetchMarketStatus({ market = "US", provider = "demo" } = {}) {
  return requestStockApi("/api/market-status", { market, provider });
}

async function requestStockApi(path, params = {}) {
  const url = new URL(path, API_BASE_URL || window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new StockApiError(payload.error?.message ?? "Stock API request failed.", {
      code: payload.error?.code,
      provider: payload.error?.provider,
      status: response.status,
      providerStatus: payload.providerStatus,
    });
  }

  return payload;
}

export class StockApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "StockApiError";
    Object.assign(this, details);
  }
}
