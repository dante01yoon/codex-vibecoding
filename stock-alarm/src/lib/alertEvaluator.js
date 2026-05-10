const RULE_LABELS = {
  price: "가격",
  daily_change_percent: "일일 등락률",
};

const OPERATOR_LABELS = {
  above: "설정값 이상",
  below: "설정값 이하",
};

export function evaluateAlertRules({ rules, quotes, now = new Date() }) {
  const quoteMap = toQuoteMap(quotes);
  const evaluatedAt = toValidDate(now) ?? new Date();

  const results = rules.map((rule) =>
    evaluateAlertRule({
      rule,
      quote: quoteMap.get(rule.symbol),
      now: evaluatedAt,
    }),
  );

  return {
    results,
    events: results
      .filter((result) => result.status === "triggered")
      .map((result) => createAlertEvent(result, evaluatedAt)),
  };
}

export function evaluateAlertRule({ rule, quote, now = new Date() }) {
  if (!rule.enabled) {
    return { rule, quote, status: "disabled", reason: "Rule is disabled." };
  }

  if (!quote) {
    return { rule, quote, status: "missing_quote", reason: "No quote found for symbol." };
  }

  const threshold = Number(rule.thresholdValue);
  const observedValue = getObservedValue(rule, quote);

  if (!Number.isFinite(threshold)) {
    return { rule, quote, status: "invalid_rule", reason: "Threshold is not numeric." };
  }

  if (!Number.isFinite(observedValue)) {
    return { rule, quote, status: "missing_value", reason: "Quote does not include this value." };
  }

  const conditionMet =
    rule.operator === "above" ? observedValue >= threshold : observedValue <= threshold;

  if (!conditionMet) {
    return {
      rule,
      quote,
      observedValue,
      status: "inactive",
      reason: "Condition is not met.",
    };
  }

  const cooldownUntil = getCooldownUntil(rule, now);

  if (cooldownUntil && cooldownUntil.getTime() > now.getTime()) {
    return {
      rule,
      quote,
      cooldownUntil: cooldownUntil.toISOString(),
      observedValue,
      status: "cooldown",
      reason: "Rule is still in cooldown.",
    };
  }

  return {
    rule,
    quote,
    observedValue,
    status: "triggered",
    reason: "Condition is met.",
  };
}

export function getCooldownUntil(rule, now = new Date()) {
  const cooldownMinutes = Number(rule.cooldownMinutes ?? 0);
  const lastTriggeredAt = toValidDate(rule.lastTriggeredAt);

  if (!lastTriggeredAt || !Number.isFinite(cooldownMinutes) || cooldownMinutes <= 0) {
    return null;
  }

  return new Date(lastTriggeredAt.getTime() + cooldownMinutes * 60 * 1000);
}

export function createAlertEvent(result, now = new Date()) {
  const { quote, rule, observedValue } = result;

  return {
    id: `alert-${rule.id}-${now.getTime()}`,
    alertRuleId: rule.id,
    symbol: rule.symbol,
    message: `${rule.symbol} ${ruleLabel(rule)} 조건을 충족했습니다.`,
    triggeredValue: formatTriggeredValue({
      currency: quote.currency,
      ruleType: rule.ruleType,
      value: observedValue,
    }),
    createdAt: now.toISOString(),
    acknowledgedAt: null,
  };
}

export function formatTriggeredValue({ currency, ruleType, value }) {
  if (ruleType === "daily_change_percent") {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  }

  return new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(value);
}

function getObservedValue(rule, quote) {
  if (rule.ruleType === "daily_change_percent") {
    return Number(quote.changePercent);
  }

  return Number(quote.price);
}

function ruleLabel(rule) {
  const ruleType = RULE_LABELS[rule.ruleType] ?? "알림";
  const operator = OPERATOR_LABELS[rule.operator] ?? "조건";

  return `${ruleType} ${operator}`;
}

function toQuoteMap(quotes) {
  if (quotes instanceof Map) {
    return quotes;
  }

  if (Array.isArray(quotes)) {
    return new Map(quotes.map((quote) => [quote.symbol, quote]));
  }

  return new Map(Object.entries(quotes ?? {}));
}

function toValidDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}
