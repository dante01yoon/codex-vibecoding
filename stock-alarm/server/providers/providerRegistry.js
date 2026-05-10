import { alphaVantageProvider } from "./alphaVantageProvider.js";
import { demoProvider } from "./demoProvider.js";
import { kisProvider } from "./kisProvider.js";

const providers = new Map(
  [demoProvider, alphaVantageProvider, kisProvider].map((provider) => [provider.id, provider]),
);

export function getProvider(providerId = "demo", market = "US") {
  if (providerId === "auto") {
    return market === "KR" ? kisProvider : alphaVantageProvider;
  }

  return providers.get(providerId) ?? demoProvider;
}

export function listProviders() {
  return [...providers.values()].map(({ id, label }) => ({ id, label }));
}
