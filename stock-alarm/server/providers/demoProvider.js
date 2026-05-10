import {
  getDemoHistory,
  getDemoMarketStatus,
  getDemoQuotes,
  getDemoSymbolRecords,
} from "../../src/lib/demoMarketData.js";

export const demoProvider = {
  id: "demo",
  label: "Demo provider",

  async searchSymbols({ market = "All", query = "" } = {}) {
    return getDemoSymbolRecords({ market, query });
  },

  async getQuotes({ symbols = [] } = {}) {
    return getDemoQuotes(symbols);
  },

  async getHistory({ range = "1M", symbol } = {}) {
    return getDemoHistory(symbol, range);
  },

  async getMarketStatus({ market = "US" } = {}) {
    return getDemoMarketStatus(market);
  },
};
