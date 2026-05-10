export function toWatchlistRow(stock, userId) {
  return {
    currency: stock.currency,
    display_name: stock.displayName,
    exchange: stock.exchange,
    market: stock.market,
    provider: stock.provider,
    symbol: stock.symbol,
    user_id: userId,
  };
}

export function toWatchlistItem(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    currency: row.currency,
    displayName: row.display_name,
    exchange: row.exchange,
    market: row.market,
    provider: row.provider,
    symbol: row.symbol,
  };
}

export function toAlertRuleRow(rule, userId) {
  return {
    cooldown_minutes: Number(rule.cooldownMinutes),
    enabled: Boolean(rule.enabled),
    last_triggered_at: rule.lastTriggeredAt ?? null,
    operator: rule.operator,
    rule_type: rule.ruleType,
    symbol: rule.symbol,
    threshold_value: Number(rule.thresholdValue),
    user_id: userId,
    watchlist_item_id: rule.watchlistItemId,
  };
}

export function toAlertRule(row) {
  return {
    id: row.id,
    cooldownMinutes: Number(row.cooldown_minutes),
    createdAt: row.created_at,
    enabled: row.enabled,
    lastTriggeredAt: row.last_triggered_at,
    operator: row.operator,
    ruleType: row.rule_type,
    symbol: row.symbol,
    thresholdValue: Number(row.threshold_value),
    updatedAt: row.updated_at,
    watchlistItemId: row.watchlist_item_id,
  };
}

export function toAlertEventRow(event, userId) {
  return {
    acknowledged_at: event.acknowledgedAt ?? null,
    alert_rule_id: event.alertRuleId,
    created_at: event.createdAt,
    message: event.message,
    symbol: event.symbol,
    triggered_value: event.triggeredValue,
    user_id: userId,
  };
}

export function toAlertEvent(row) {
  return {
    id: row.id,
    acknowledgedAt: row.acknowledged_at,
    alertRuleId: row.alert_rule_id,
    createdAt: row.created_at,
    message: row.message,
    symbol: row.symbol,
    triggeredValue: row.triggered_value,
  };
}
