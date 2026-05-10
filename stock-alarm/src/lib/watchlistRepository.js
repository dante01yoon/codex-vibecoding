import { toWatchlistItem, toWatchlistRow } from "./supabaseMappers.js";

export async function listWatchlistItems(client) {
  const { data, error } = await client
    .from("watchlist_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(toWatchlistItem);
}

export async function upsertWatchlistItem(client, { stock, userId }) {
  const { data, error } = await client
    .from("watchlist_items")
    .upsert(toWatchlistRow(stock, userId), {
      onConflict: "user_id,symbol,market,provider",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toWatchlistItem(data);
}
