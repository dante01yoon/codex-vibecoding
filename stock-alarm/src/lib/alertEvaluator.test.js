import assert from "node:assert/strict";
import test from "node:test";

import { evaluateAlertRule, evaluateAlertRules, getCooldownUntil } from "./alertEvaluator.js";

const NOW = new Date("2026-05-10T03:00:00.000Z");

const quote = {
  symbol: "AAPL",
  price: 189.42,
  currency: "USD",
  changePercent: 0.68,
};

function makeRule(overrides = {}) {
  return {
    id: "rule-aapl",
    symbol: "AAPL",
    ruleType: "price",
    operator: "above",
    thresholdValue: 190,
    cooldownMinutes: 15,
    enabled: true,
    lastTriggeredAt: null,
    ...overrides,
  };
}

test("price above triggers when quote price is at or above threshold", () => {
  const result = evaluateAlertRule({
    now: NOW,
    quote,
    rule: makeRule({ thresholdValue: 180 }),
  });

  assert.equal(result.status, "triggered");
  assert.equal(result.observedValue, 189.42);
});

test("price below triggers when quote price is at or below threshold", () => {
  const result = evaluateAlertRule({
    now: NOW,
    quote,
    rule: makeRule({ operator: "below", thresholdValue: 190 }),
  });

  assert.equal(result.status, "triggered");
});

test("daily percent above and below rules use changePercent", () => {
  const above = evaluateAlertRule({
    now: NOW,
    quote,
    rule: makeRule({
      ruleType: "daily_change_percent",
      operator: "above",
      thresholdValue: 0.5,
    }),
  });
  const below = evaluateAlertRule({
    now: NOW,
    quote: { ...quote, changePercent: -1.2 },
    rule: makeRule({
      ruleType: "daily_change_percent",
      operator: "below",
      thresholdValue: -1,
    }),
  });

  assert.equal(above.status, "triggered");
  assert.equal(above.observedValue, 0.68);
  assert.equal(below.status, "triggered");
  assert.equal(below.observedValue, -1.2);
});

test("disabled rules and missing quotes are skipped without triggering events", () => {
  const { events, results } = evaluateAlertRules({
    now: NOW,
    quotes: [quote],
    rules: [makeRule({ enabled: false }), makeRule({ id: "rule-msft", symbol: "MSFT" })],
  });

  assert.deepEqual(
    results.map((result) => result.status),
    ["disabled", "missing_quote"],
  );
  assert.equal(events.length, 0);
});

test("missing quote values are skipped without triggering events", () => {
  const { events, results } = evaluateAlertRules({
    now: NOW,
    quotes: [{ ...quote, price: undefined }],
    rules: [makeRule({ thresholdValue: 180 })],
  });

  assert.equal(results[0].status, "missing_value");
  assert.equal(events.length, 0);
});

test("cooldown prevents repeated trigger until the cooldown window passes", () => {
  const inCooldown = evaluateAlertRule({
    now: NOW,
    quote,
    rule: makeRule({
      thresholdValue: 180,
      lastTriggeredAt: "2026-05-10T02:50:00.000Z",
    }),
  });
  const cooldownUntil = getCooldownUntil(inCooldown.rule, NOW);

  assert.equal(inCooldown.status, "cooldown");
  assert.equal(cooldownUntil.toISOString(), "2026-05-10T03:05:00.000Z");
});

test("triggered rules create alert events with display values", () => {
  const { events } = evaluateAlertRules({
    now: NOW,
    quotes: [quote],
    rules: [makeRule({ thresholdValue: 180 })],
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].alertRuleId, "rule-aapl");
  assert.equal(events[0].symbol, "AAPL");
  assert.equal(events[0].triggeredValue, "$189.42");
  assert.equal(events[0].acknowledgedAt, null);
  assert.match(events[0].message, /조건을 충족했습니다/);
});
