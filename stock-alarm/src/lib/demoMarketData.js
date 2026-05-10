export const DEMO_STOCKS = [
  {
    symbol: "AAPL",
    displayName: "Apple Inc.",
    market: "US",
    exchange: "NASDAQ",
    currency: "USD",
    provider: "Demo provider",
    price: 189.42,
    change: 1.28,
    changePercent: 0.68,
    previousClose: 188.14,
    timestamp: "2026-05-09T13:00:00.000Z",
    updatedAt: "2026-05-09 22:00 KST",
    isSample: true,
    isDelayed: true,
    marketStatus: "Market closed",
    history: [181.2, 182.4, 181.8, 184.1, 185.7, 187.2, 186.9, 188.1, 189.4],
  },
  {
    symbol: "MSFT",
    displayName: "Microsoft Corp.",
    market: "US",
    exchange: "NASDAQ",
    currency: "USD",
    provider: "Demo provider",
    price: 493.36,
    change: -2.14,
    changePercent: -0.43,
    previousClose: 495.5,
    timestamp: "2026-05-09T13:00:00.000Z",
    updatedAt: "2026-05-09 22:00 KST",
    isSample: true,
    isDelayed: true,
    marketStatus: "Market closed",
    history: [486.1, 488.6, 492.2, 491.4, 495.8, 497.1, 496.4, 494.8, 493.4],
  },
  {
    symbol: "005930",
    displayName: "삼성전자",
    market: "KR",
    exchange: "KRX",
    currency: "KRW",
    provider: "Demo provider",
    price: 82200,
    change: -900,
    changePercent: -1.08,
    previousClose: 83100,
    timestamp: "2026-05-09T06:30:00.000Z",
    updatedAt: "2026-05-09 15:30 KST",
    isSample: true,
    isDelayed: false,
    marketStatus: "Market closed",
    history: [80100, 81200, 81800, 82900, 82600, 83500, 83100, 82400, 82200],
  },
  {
    symbol: "000660",
    displayName: "SK하이닉스",
    market: "KR",
    exchange: "KRX",
    currency: "KRW",
    provider: "Demo provider",
    price: 214500,
    change: 3500,
    changePercent: 1.66,
    previousClose: 211000,
    timestamp: "2026-05-09T06:30:00.000Z",
    updatedAt: "2026-05-09 15:30 KST",
    isSample: true,
    isDelayed: false,
    marketStatus: "Market closed",
    history: [205000, 207500, 206000, 210000, 211000, 213500, 212000, 214000, 214500],
  },
];

export function getDemoStocks() {
  return DEMO_STOCKS.map((stock) => ({ ...stock, history: [...stock.history] }));
}

export function getDemoSymbolRecords({ market = "All", query = "" } = {}) {
  const normalizedMarket = market === "All" ? "" : market;
  const normalizedQuery = query.trim().toLowerCase();

  return DEMO_STOCKS.filter((stock) => {
    const matchesMarket = !normalizedMarket || stock.market === normalizedMarket;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      stock.symbol.toLowerCase().includes(normalizedQuery) ||
      stock.displayName.toLowerCase().includes(normalizedQuery);

    return matchesMarket && matchesQuery;
  }).map(toSymbolRecord);
}

export function getDemoQuotes(symbols = []) {
  const normalizedSymbols = new Set(
    symbols.map((symbol) => String(symbol).trim()).filter(Boolean),
  );

  return DEMO_STOCKS.filter(
    (stock) => normalizedSymbols.size === 0 || normalizedSymbols.has(stock.symbol),
  ).map(toQuoteRecord);
}

export function getDemoHistory(symbol, range = "1M") {
  const stock = DEMO_STOCKS.find((item) => item.symbol === symbol) ?? DEMO_STOCKS[0];

  return {
    symbol: stock.symbol,
    range,
    provider: stock.provider,
    isSample: true,
    bars: stock.history.map((close, index) => ({
      time: `T-${stock.history.length - index - 1}`,
      open: close,
      high: close,
      low: close,
      close,
      volume: null,
    })),
  };
}

export function getDemoMarketStatus(market = "US") {
  return {
    market,
    provider: "Demo provider",
    isOpen: false,
    status: "Market closed",
    timestamp: "2026-05-09T13:00:00.000Z",
    isSample: true,
  };
}

export function getDemoHistoryValues(symbol) {
  return getDemoHistory(symbol).bars.map((bar) => bar.close);
}

export function toSymbolRecord(stock) {
  return {
    symbol: stock.symbol,
    market: stock.market,
    exchange: stock.exchange,
    displayName: stock.displayName,
    currency: stock.currency,
    provider: stock.provider,
  };
}

export function toQuoteRecord(stock) {
  return {
    symbol: stock.symbol,
    market: stock.market,
    price: stock.price,
    currency: stock.currency,
    change: stock.change,
    changePercent: stock.changePercent,
    previousClose: stock.previousClose,
    timestamp: stock.timestamp,
    updatedAt: stock.updatedAt,
    provider: stock.provider,
    isDelayed: stock.isDelayed,
    isSample: stock.isSample,
    marketStatus: stock.marketStatus,
  };
}
