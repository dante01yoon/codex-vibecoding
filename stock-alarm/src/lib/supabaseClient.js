import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

export function getSupabaseBrowserConfig() {
  return {
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
    url: import.meta.env.VITE_SUPABASE_URL ?? "",
  };
}

export function isSupabaseConfigured() {
  const { publishableKey, url } = getSupabaseBrowserConfig();

  return Boolean(url && publishableKey);
}

export function getSupabaseClient() {
  const { publishableKey, url } = getSupabaseBrowserConfig();

  if (!url || !publishableKey) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  return supabaseClient;
}

export async function ensureAnonymousSession() {
  const client = getSupabaseClient();

  if (!client) {
    return { client: null, status: "not_configured", user: null };
  }

  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (session?.user) {
    return { client, status: "ready", user: session.user };
  }

  const { data, error } = await client.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  return { client, status: "ready", user: data.user };
}
