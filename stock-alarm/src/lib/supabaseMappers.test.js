import assert from "node:assert/strict";
import test from "node:test";

import {
  toAlertEvent,
  toAlertEventRow,
  toAlertRule,
  toAlertRuleRow,
  toWatchlistItem,
  toWatchlistRow,
} from "./supabaseMappers.js";

const USER_ID = "00000000-0000-4000-8000-000000000001";

test("watchlist mapper keeps browser-safe stock metadata", () => {
  const row = toWatchlistRow(
    {
      currency: "USD",
      displayName: "Apple Inc.",
      exchange: "NASDAQ",
      market: "US",
      provider: "Alpha Vantage",
      symbol: "AAPL",
    },
    USER_ID,
  );

  assert.deepEqual(row, {
    currency: "USD",
    display_name: "Apple Inc.",
    exchange: "NASDAQ",
    market: "US",
    provider: "Alpha Vantage",
    symbol: "AAPL",
    user_id: USER_ID,
  });
  assert.equal(
    toWatchlistItem({ ...row, created_at: "2026-05-10T00:00:00.000Z", id: "watch-1" })
      .displayName,
    "Apple Inc.",
  );
});

test("alert rule mapper converts camelCase UI shape to RLS row shape", () => {
  const row = toAlertRuleRow(
    {
      cooldownMinutes: 15,
      enabled: true,
      lastTriggeredAt: null,
      operator: "above",
      ruleType: "price",
      symbol: "AAPL",
      thresholdValue: "190",
      watchlistItemId: "watch-1",
    },
    USER_ID,
  );

  assert.equal(row.cooldown_minutes, 15);
  assert.equal(row.rule_type, "price");
  assert.equal(row.threshold_value, 190);
  assert.equal(row.user_id, USER_ID);

  const rule = toAlertRule({
    ...row,
    created_at: "2026-05-10T00:00:00.000Z",
    id: "rule-1",
    updated_at: "2026-05-10T00:00:00.000Z",
  });

  assert.equal(rule.cooldownMinutes, 15);
  assert.equal(rule.ruleType, "price");
  assert.equal(rule.thresholdValue, 190);
});

test("alert event mapper preserves acknowledgedAt null contract", () => {
  const row = toAlertEventRow(
    {
      acknowledgedAt: null,
      alertRuleId: "rule-1",
      createdAt: "2026-05-10T00:00:00.000Z",
      message: "AAPL 조건을 충족했습니다.",
      symbol: "AAPL",
      triggeredValue: "$190.00",
    },
    USER_ID,
  );

  assert.equal(row.acknowledged_at, null);
  assert.equal(row.user_id, USER_ID);

  const event = toAlertEvent({ ...row, id: "event-1" });

  assert.equal(event.acknowledgedAt, null);
  assert.equal(event.alertRuleId, "rule-1");
});
