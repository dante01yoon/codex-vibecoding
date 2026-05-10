import { toAlertRule, toAlertRuleRow } from "./supabaseMappers.js";

export async function listAlertRules(client) {
  const { data, error } = await client
    .from("alert_rules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(toAlertRule);
}

export async function insertAlertRule(client, { rule, userId }) {
  const { data, error } = await client
    .from("alert_rules")
    .insert(toAlertRuleRow(rule, userId))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toAlertRule(data);
}

export async function setAlertRuleEnabled(client, { enabled, ruleId }) {
  const { data, error } = await client
    .from("alert_rules")
    .update({
      enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ruleId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return toAlertRule(data);
}

export async function setAlertRulesTriggeredAt(client, { ruleIds, triggeredAt }) {
  if (ruleIds.length === 0) {
    return [];
  }

  const { data, error } = await client
    .from("alert_rules")
    .update({
      last_triggered_at: triggeredAt,
      updated_at: triggeredAt,
    })
    .in("id", ruleIds)
    .select("*");

  if (error) {
    throw error;
  }

  return data.map(toAlertRule);
}
