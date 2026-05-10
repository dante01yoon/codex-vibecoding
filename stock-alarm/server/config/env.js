import "dotenv/config";

export function getServerEnv() {
  return {
    alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY ?? "",
    host: process.env.STOCK_API_HOST ?? "127.0.0.1",
    kisAccessToken: process.env.KIS_ACCESS_TOKEN ?? "",
    kisAppKey: process.env.KIS_APP_KEY ?? "",
    kisAppSecret: process.env.KIS_APP_SECRET ?? "",
    kisBaseUrl: process.env.KIS_BASE_URL ?? "https://openapi.koreainvestment.com:9443",
    port: Number(process.env.STOCK_API_PORT ?? 8787),
  };
}

export function missingConfig(message, provider) {
  const error = new Error(message);
  error.code = "PROVIDER_SETUP_REQUIRED";
  error.status = 503;
  error.provider = provider;
  return error;
}
