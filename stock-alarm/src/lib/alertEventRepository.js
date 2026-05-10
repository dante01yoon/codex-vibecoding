import { toAlertEvent, toAlertEventRow } from "./supabaseMappers.js";

export async function listAlertEvents(client) {
  const { data, error } = await client
    .from("alert_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return data.map(toAlertEvent);
}

export async function insertAlertEvents(client, { events, userId }) {
  if (events.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("alert_events")
    .insert(events.map((event) => toAlertEventRow(event, userId)))
    .select("*");

  if (error) {
    throw error;
  }

  return data.map(toAlertEvent);
}

export async function acknowledgeAlertEvent(client, { acknowledgedAt, alertId }) {
  const { data, error } = await client
    .from("alert_events")
    .update({ acknowledged_at: acknowledgedAt })
    .eq("id", alertId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toAlertEvent(data);
}

export async function acknowledgeAlertEventsForSymbol(client, { acknowledgedAt, symbol }) {
  const { data, error } = await client
    .from("alert_events")
    .update({ acknowledged_at: acknowledgedAt })
    .eq("symbol", symbol)
    .is("acknowledged_at", null)
    .select("*");

  if (error) {
    throw error;
  }

  return data.map(toAlertEvent);
}
