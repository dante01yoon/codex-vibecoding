import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const filesToCopy = ["index.html", "styles.css", "script.js"];

function clean(value) {
  return String(value || "").trim();
}

function hasValue(value) {
  return clean(value).length > 0;
}

function assertPublicKey(key) {
  const normalized = clean(key);

  if (
    normalized.startsWith("sb_secret_") ||
    normalized.toLowerCase().includes("service_role") ||
    normalized.startsWith("postgres://") ||
    normalized.startsWith("postgresql://")
  ) {
    throw new Error("Do not expose Supabase secret/service_role/database keys in browser config.");
  }

  return normalized;
}

function readConfigFromEnv() {
  const url = clean(process.env.SUPABASE_URL);
  const publishableKey = assertPublicKey(
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY,
  );
  const captchaProvider = clean(process.env.CAPTCHA_PROVIDER || "turnstile").toLowerCase();
  const turnstileSiteKey = clean(process.env.TURNSTILE_SITE_KEY);

  if (!hasValue(url) && !hasValue(publishableKey) && !hasValue(turnstileSiteKey)) {
    return null;
  }

  if (!hasValue(url) || !hasValue(publishableKey)) {
    throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required together.");
  }

  if (captchaProvider !== "turnstile" && captchaProvider !== "hcaptcha") {
    throw new Error("CAPTCHA_PROVIDER must be turnstile or hcaptcha.");
  }

  return {
    url,
    publishableKey,
    captcha:
      hasValue(turnstileSiteKey)
        ? {
            provider: captchaProvider,
            siteKey: turnstileSiteKey,
          }
        : undefined,
  };
}

function renderConfig(config) {
  const lines = [
    "window.FIGMA_CALENDAR_SUPABASE = {",
    `  url: ${JSON.stringify(config.url)},`,
    `  publishableKey: ${JSON.stringify(config.publishableKey)},`,
  ];

  if (config.captcha) {
    lines.push("  captcha: {");
    lines.push(`    provider: ${JSON.stringify(config.captcha.provider)},`);
    lines.push(`    siteKey: ${JSON.stringify(config.captcha.siteKey)},`);
    lines.push("  },");
  }

  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeBrowserConfig() {
  const envConfig = readConfigFromEnv();
  const distConfigPath = path.join(distDir, "supabase-config.js");

  if (envConfig) {
    await fs.writeFile(distConfigPath, renderConfig(envConfig), "utf8");
    console.log("Generated dist/supabase-config.js from deployment environment variables.");
    return;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Missing Vercel environment variables. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and TURNSTILE_SITE_KEY.",
    );
  }

  const localConfigPath = path.join(rootDir, "supabase-config.js");
  const exampleConfigPath = path.join(rootDir, "supabase-config.example.js");
  const sourcePath = (await pathExists(localConfigPath)) ? localConfigPath : exampleConfigPath;
  await fs.copyFile(sourcePath, distConfigPath);
  console.log(`Copied ${path.basename(sourcePath)} to dist/supabase-config.js for local preview.`);
}

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  for (const fileName of filesToCopy) {
    await fs.copyFile(path.join(rootDir, fileName), path.join(distDir, fileName));
  }

  await writeBrowserConfig();
  console.log("Deployment build ready in dist/.");
}

main().catch((error) => {
  console.error(`[build-deploy] ${error.message}`);
  process.exit(1);
});
