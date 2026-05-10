import {
  Bell,
  BellRing,
  Check,
  ChevronDown,
  Clock3,
  LineChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { evaluateAlertRules } from "./lib/alertEvaluator.js";

const STOCKS = [
  {
    symbol: "AAPL",
    displayName: "Apple Inc.",
    market: "US",
    exchange: "NASDAQ",
    currency: "USD",
    provider: "Demo provider",
    price: 189.42,
    change: 1.28,
    changePercent: 0.68,
    previousClose: 188.14,
    updatedAt: "2026-05-09 22:00 KST",
    isSample: true,
    isDelayed: true,
    marketStatus: "Market closed",
    history: [181.2, 182.4, 181.8, 184.1, 185.7, 187.2, 186.9, 188.1, 189.4],
  },
  {
    symbol: "MSFT",
    displayName: "Microsoft Corp.",
    market: "US",
    exchange: "NASDAQ",
    currency: "USD",
    provider: "Demo provider",
    price: 493.36,
    change: -2.14,
    changePercent: -0.43,
    previousClose: 495.5,
    updatedAt: "2026-05-09 22:00 KST",
    isSample: true,
    isDelayed: true,
    marketStatus: "Market closed",
    history: [486.1, 488.6, 492.2, 491.4, 495.8, 497.1, 496.4, 494.8, 493.4],
  },
  {
    symbol: "005930",
    displayName: "삼성전자",
    market: "KR",
    exchange: "KRX",
    currency: "KRW",
    provider: "Demo provider",
    price: 82200,
    change: -900,
    changePercent: -1.08,
    previousClose: 83100,
    updatedAt: "2026-05-09 15:30 KST",
    isSample: true,
    isDelayed: false,
    marketStatus: "Market closed",
    history: [80100, 81200, 81800, 82900, 82600, 83500, 83100, 82400, 82200],
  },
  {
    symbol: "000660",
    displayName: "SK하이닉스",
    market: "KR",
    exchange: "KRX",
    currency: "KRW",
    provider: "Demo provider",
    price: 214500,
    change: 3500,
    changePercent: 1.66,
    previousClose: 211000,
    updatedAt: "2026-05-09 15:30 KST",
    isSample: true,
    isDelayed: false,
    marketStatus: "Market closed",
    history: [205000, 207500, 206000, 210000, 211000, 213500, 212000, 214000, 214500],
  },
];

const demoTimestamp = (minutesAgo) => new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();

const INITIAL_RULES = [
  {
    id: "rule-aapl-price",
    symbol: "AAPL",
    ruleType: "price",
    operator: "above",
    thresholdValue: 190,
    cooldownMinutes: 15,
    enabled: true,
    lastTriggeredAt: demoTimestamp(12),
  },
  {
    id: "rule-aapl-percent",
    symbol: "AAPL",
    ruleType: "daily_change_percent",
    operator: "above",
    thresholdValue: 0.5,
    cooldownMinutes: 30,
    enabled: true,
    lastTriggeredAt: demoTimestamp(1),
  },
  {
    id: "rule-samsung-price",
    symbol: "005930",
    ruleType: "price",
    operator: "below",
    thresholdValue: 82000,
    cooldownMinutes: 60,
    enabled: false,
    lastTriggeredAt: null,
  },
];

const INITIAL_ALERTS = [
  {
    id: "alert-aapl-percent",
    symbol: "AAPL",
    message: "AAPL 일일 등락률이 설정값 이상입니다.",
    triggeredValue: "+0.68%",
    createdAt: demoTimestamp(1),
    acknowledgedAt: null,
  },
  {
    id: "alert-samsung-price",
    symbol: "005930",
    message: "005930 가격이 설정값 이하입니다.",
    triggeredValue: "82,200 KRW",
    createdAt: demoTimestamp(18),
    acknowledgedAt: demoTimestamp(15),
  },
];

const MARKET_FILTERS = ["All", "US", "KR"];
const RANGE_OPTIONS = ["1D", "1W", "1M", "6M", "1Y"];

function getInitialNotificationState() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.permission === "default" ? "needed" : window.Notification.permission;
}

function App() {
  const [query, setQuery] = useState("");
  const [marketFilter, setMarketFilter] = useState("All");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [watchlist, setWatchlist] = useState(["AAPL", "005930", "000660"]);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [range, setRange] = useState("1M");
  const [notificationState, setNotificationState] = useState(getInitialNotificationState);
  const [lastEvaluation, setLastEvaluation] = useState("아직 평가 전");
  const [form, setForm] = useState({
    ruleType: "price",
    operator: "above",
    thresholdValue: "",
    cooldownMinutes: 15,
    enabled: true,
  });
  const [formError, setFormError] = useState("");

  const selectedStock = STOCKS.find((stock) => stock.symbol === selectedSymbol) ?? STOCKS[0];
  const selectedRules = rules.filter((rule) => rule.symbol === selectedStock.symbol);
  const selectedAlerts = alerts.filter((alert) => alert.symbol === selectedStock.symbol);
  const watchlistStocks = watchlist
    .map((symbol) => STOCKS.find((stock) => stock.symbol === symbol))
    .filter(Boolean);

  const filteredStocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return STOCKS.filter((stock) => {
      const matchesMarket = marketFilter === "All" || stock.market === marketFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        stock.symbol.toLowerCase().includes(normalizedQuery) ||
        stock.displayName.toLowerCase().includes(normalizedQuery);

      return matchesMarket && matchesQuery;
    });
  }, [marketFilter, query]);

  function handleAddToWatchlist() {
    if (!watchlist.includes(selectedStock.symbol)) {
      setWatchlist((items) => [...items, selectedStock.symbol]);
    }
  }

  async function handleNotificationRequest() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationState("unsupported");
      return;
    }

    if (window.Notification.permission === "granted") {
      setNotificationState("granted");
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationState(permission === "default" ? "needed" : permission);
  }

  function showBrowserNotifications(events) {
    if (
      notificationState !== "granted" ||
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    events.forEach((event) => {
      try {
        new window.Notification("Stock Alarm", {
          body: `${event.message} (${event.triggeredValue})`,
        });
      } catch {
        setNotificationState("needed");
      }
    });
  }

  function handleRunDemoEvaluation() {
    const now = new Date();
    const watchedRules = rules.filter((rule) => watchlist.includes(rule.symbol));
    const { events, results } = evaluateAlertRules({
      now,
      quotes: STOCKS,
      rules: watchedRules,
    });
    const triggeredRuleIds = new Set(events.map((event) => event.alertRuleId));
    const cooldownCount = results.filter((result) => result.status === "cooldown").length;

    if (events.length > 0) {
      setAlerts((items) => [...events, ...items].slice(0, 8));
      setRules((items) =>
        items.map((rule) =>
          triggeredRuleIds.has(rule.id) ? { ...rule, lastTriggeredAt: now.toISOString() } : rule,
        ),
      );
      showBrowserNotifications(events);
      setLastEvaluation(`${events.length}개 조건 충족 · ${formatRelativeTime(now.toISOString())}`);
      return;
    }

    if (cooldownCount > 0) {
      setLastEvaluation(`쿨다운 중 ${cooldownCount}개 · ${formatRelativeTime(now.toISOString())}`);
      return;
    }

    setLastEvaluation(`새 알림 없음 · ${formatRelativeTime(now.toISOString())}`);
  }

  function handleRuleSubmit(event) {
    event.preventDefault();
    const threshold = Number(form.thresholdValue);
    const cooldown = Number(form.cooldownMinutes);

    if (!Number.isFinite(threshold)) {
      setFormError("설정값을 숫자로 입력하세요.");
      return;
    }

    if (!Number.isFinite(cooldown) || cooldown < 0) {
      setFormError("쿨다운은 0 이상의 숫자로 입력하세요.");
      return;
    }

    setRules((items) => [
      ...items,
      {
        id: `rule-${selectedStock.symbol}-${Date.now()}`,
        symbol: selectedStock.symbol,
        ruleType: form.ruleType,
        operator: form.operator,
        thresholdValue: threshold,
        cooldownMinutes: cooldown,
        enabled: form.enabled,
        lastTriggeredAt: null,
      },
    ]);
    setForm((current) => ({ ...current, thresholdValue: "" }));
    setFormError("");
  }

  function toggleRule(ruleId) {
    setRules((items) =>
      items.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)),
    );
  }

  function acknowledgeAlert(alertId) {
    const acknowledgedAt = new Date().toISOString();

    setAlerts((items) =>
      items.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledgedAt } : alert,
      ),
    );
  }

  function acknowledgeSelectedAlerts() {
    const acknowledgedAt = new Date().toISOString();

    setAlerts((items) =>
      items.map((alert) =>
        alert.symbol === selectedStock.symbol && !alert.acknowledgedAt
          ? { ...alert, acknowledgedAt }
          : alert,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-primary">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <AppHeader
          notificationState={notificationState}
          onNotificationClick={handleNotificationRequest}
          onRefreshClick={handleRunDemoEvaluation}
        />

        <StatusBar
          lastEvaluation={lastEvaluation}
          notificationState={notificationState}
          selectedStock={selectedStock}
        />

        <main className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_340px] xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <section className="order-2 lg:order-1">
            <SearchPanel
              filteredStocks={filteredStocks}
              marketFilter={marketFilter}
              query={query}
              selectedSymbol={selectedStock.symbol}
              onMarketFilterChange={setMarketFilter}
              onQueryChange={setQuery}
              onSelect={setSelectedSymbol}
            />

            <WatchlistPanel
              rules={rules}
              selectedSymbol={selectedStock.symbol}
              stocks={watchlistStocks}
              onSelect={setSelectedSymbol}
            />
          </section>

          <section className="order-1 min-w-0 lg:order-2">
            <StockDetail
              isWatched={watchlist.includes(selectedStock.symbol)}
              range={range}
              rules={selectedRules}
              selectedStock={selectedStock}
              onAddToWatchlist={handleAddToWatchlist}
              onRangeChange={setRange}
            />
          </section>

          <section className="order-3">
            <AlertPanel
              alerts={selectedAlerts}
              form={form}
              formError={formError}
              rules={selectedRules}
              selectedStock={selectedStock}
              onAcknowledgeAll={acknowledgeSelectedAlerts}
              onAcknowledgeAlert={acknowledgeAlert}
              onFormChange={setForm}
              onRuleSubmit={handleRuleSubmit}
              onToggleRule={toggleRule}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function AppHeader({ notificationState, onNotificationClick, onRefreshClick }) {
  return (
    <header className="flex flex-col gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-brand-primary text-bg-surface">
            <LineChart aria-hidden="true" size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-8 tracking-[0px]">Stock Alarm</h1>
            <p className="text-sm leading-5 text-text-muted">
              브라우저가 열려 있는 동안 설정한 조건을 확인합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="sample">Sample data</StatusBadge>
        <StatusBadge tone="warning">Market closed</StatusBadge>
        <IconButton label="데모 알림 평가" title="데모 알림 평가" onClick={onRefreshClick}>
          <RefreshCw aria-hidden="true" size={18} />
        </IconButton>
        <IconButton
          disabled={notificationState === "unsupported"}
          label={notificationButtonLabel(notificationState)}
          title={notificationButtonLabel(notificationState)}
          onClick={onNotificationClick}
        >
          {notificationState === "granted" ? (
            <BellRing aria-hidden="true" size={18} />
          ) : (
            <Bell aria-hidden="true" size={18} />
          )}
        </IconButton>
        <IconButton label="설정" title="설정">
          <Settings aria-hidden="true" size={18} />
        </IconButton>
      </div>
    </header>
  );
}

function StatusBar({ lastEvaluation, notificationState, selectedStock }) {
  return (
    <section
      aria-label="데이터 상태"
      className="grid gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-sm text-text-secondary md:grid-cols-2 xl:grid-cols-4"
    >
      <InlineStatus
        icon={<ShieldAlert aria-hidden="true" size={17} />}
        label="데이터 출처"
        value={`${selectedStock.provider} · 샘플 데이터`}
        tone="sample"
      />
      <InlineStatus
        icon={<Clock3 aria-hidden="true" size={17} />}
        label="업데이트"
        value={selectedStock.updatedAt}
        tone="warning"
      />
      <InlineStatus
        icon={<Bell aria-hidden="true" size={17} />}
        label="알림 권한"
        value={notificationStatusLabel(notificationState)}
        tone={notificationStatusTone(notificationState)}
      />
      <InlineStatus
        icon={<RefreshCw aria-hidden="true" size={17} />}
        label="데모 평가"
        value={lastEvaluation}
        tone="info"
      />
    </section>
  );
}

function SearchPanel({
  filteredStocks,
  marketFilter,
  onMarketFilterChange,
  onQueryChange,
  onSelect,
  query,
  selectedSymbol,
}) {
  return (
    <Panel title="종목 검색" icon={<Search aria-hidden="true" size={18} />}>
      <label className="block text-sm font-medium text-text-secondary" htmlFor="stock-search">
        ticker, 코드, 회사명
      </label>
      <div className="relative mt-2">
        <Search
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          size={18}
        />
        <input
          className="focus-ring h-10 w-full rounded-md border border-border-default bg-bg-surface py-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted"
          id="stock-search"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="AAPL, 005930, 삼성전자"
          type="search"
          value={query}
        />
      </div>

      <div className="mt-3 flex gap-2" role="group" aria-label="시장 필터">
        {MARKET_FILTERS.map((filter) => (
          <button
            className={`focus-ring h-9 flex-1 rounded-md border px-3 text-sm font-medium transition ${
              marketFilter === filter
                ? "border-brand-primary bg-brand-primary text-bg-surface"
                : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:bg-bg-surface-muted"
            }`}
            key={filter}
            onClick={() => onMarketFilterChange(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filteredStocks.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다"
            description="다른 ticker, 종목 코드, 회사명을 입력해 보세요."
          />
        ) : (
          filteredStocks.map((stock) => (
            <button
              className={`focus-ring w-full rounded-lg border p-3 text-left transition ${
                selectedSymbol === stock.symbol
                  ? "border-brand-primary bg-blue-50"
                  : "border-border-default bg-bg-surface hover:border-border-strong hover:bg-bg-surface-muted"
              }`}
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="tabular text-sm font-semibold text-text-primary">
                      {stock.symbol}
                    </span>
                    <span className="rounded-md bg-bg-surface-muted px-1.5 py-0.5 text-xs font-medium text-text-muted">
                      {stock.market}
                    </span>
                  </div>
                  <p className="truncate text-sm text-text-secondary">{stock.displayName}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-text-muted">
                  <div>{stock.exchange}</div>
                  <div>{stock.currency}</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Panel>
  );
}

function WatchlistPanel({ rules, selectedSymbol, stocks, onSelect }) {
  return (
    <Panel title="관심 종목" className="mt-4" icon={<SlidersHorizontal aria-hidden="true" size={18} />}>
      <div className="space-y-2">
        {stocks.map((stock) => {
          const activeRuleCount = rules.filter(
            (rule) => rule.symbol === stock.symbol && rule.enabled,
          ).length;

          return (
            <button
              className={`focus-ring w-full rounded-lg border px-3 py-2 text-left transition ${
                selectedSymbol === stock.symbol
                  ? "border-brand-primary bg-blue-50"
                  : "border-border-default bg-bg-surface hover:border-border-strong hover:bg-bg-surface-muted"
              }`}
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="tabular text-sm font-semibold">{stock.symbol}</span>
                    {activeRuleCount > 0 && (
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-monitoring-active">
                        {activeRuleCount} rules
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-text-muted">{stock.displayName}</p>
                </div>
                <PriceChange stock={stock} compact />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function StockDetail({ isWatched, onAddToWatchlist, onRangeChange, range, rules, selectedStock }) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border-default bg-bg-surface p-4 lg:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-bold leading-8 tracking-[0px]">
                {selectedStock.displayName}
              </h2>
              <StatusBadge tone="sample">Sample</StatusBadge>
              {selectedStock.isDelayed && <StatusBadge tone="warning">Delayed</StatusBadge>}
            </div>
            <p className="mt-1 text-sm text-text-muted">
              <span className="tabular">{selectedStock.symbol}</span> · {selectedStock.exchange} ·{" "}
              {selectedStock.market} · {selectedStock.currency}
            </p>
          </div>

          <button
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 text-sm font-semibold text-text-secondary transition hover:border-border-strong hover:bg-bg-surface-muted disabled:text-text-muted"
            disabled={isWatched}
            onClick={onAddToWatchlist}
            type="button"
          >
            {isWatched ? <Check aria-hidden="true" size={17} /> : <Plus aria-hidden="true" size={17} />}
            {isWatched ? "관심 종목" : "관심 종목 추가"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">현재가</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="tabular text-[28px] font-bold leading-9">
                {formatPrice(selectedStock.price, selectedStock.currency)}
              </span>
              <PriceChange stock={selectedStock} />
            </div>
          </div>

          <div className="rounded-lg border border-border-default bg-bg-surface-muted px-3 py-2 text-sm text-text-secondary">
            <div className="font-medium">{selectedStock.marketStatus}</div>
            <div className="tabular text-xs text-text-muted">{selectedStock.updatedAt}</div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border-default bg-bg-surface p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold leading-7">가격 흐름</h2>
            <p className="text-sm text-text-muted">가격 규칙은 차트 위에 threshold line으로 표시됩니다.</p>
          </div>
          <div className="flex rounded-lg border border-border-default bg-bg-surface-muted p-1" role="group" aria-label="차트 기간">
            {RANGE_OPTIONS.map((option) => (
              <button
                className={`focus-ring h-8 rounded-md px-3 text-sm font-semibold transition ${
                  range === option
                    ? "bg-bg-surface text-brand-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
                key={option}
                onClick={() => onRangeChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <PriceChart rules={rules} stock={selectedStock} />
      </section>
    </div>
  );
}

function PriceChart({ rules, stock }) {
  const values = stock.history;
  const priceRules = rules.filter((rule) => rule.enabled && rule.ruleType === "price");
  const allValues = [...values, ...priceRules.map((rule) => rule.thresholdValue)];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = Math.max((max - min) * 0.18, 1);
  const lower = min - padding;
  const upper = max + padding;
  const width = 640;
  const height = 220;
  const left = 28;
  const right = 18;
  const top = 20;
  const bottom = 32;

  const xForIndex = (index) => left + (index / (values.length - 1)) * (width - left - right);
  const yForValue = (value) =>
    top + ((upper - value) / (upper - lower)) * (height - top - bottom);
  const points = values.map((value, index) => [xForIndex(index), yForValue(value)]);
  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border-default bg-bg-surface">
      <div className="h-[240px] w-full sm:h-[340px]">
        <svg
          aria-label={`${stock.displayName} 가격 흐름 차트`}
          className="h-full w-full"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          {[0, 1, 2, 3].map((line) => {
            const y = top + (line / 3) * (height - top - bottom);
            return (
              <line
                key={line}
                stroke="#E2E8F0"
                strokeWidth="1"
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
              />
            );
          })}

          {priceRules.map((rule) => {
            const y = yForValue(rule.thresholdValue);
            return (
              <g key={rule.id}>
                <line
                  stroke="#D97706"
                  strokeDasharray="6 6"
                  strokeWidth="2"
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                />
                <text fill="#92400E" fontSize="12" fontWeight="600" x={left + 8} y={y - 8}>
                  {rule.operator === "above" ? "상한 조건" : "하한 조건"}{" "}
                  {formatCompact(rule.thresholdValue, stock.currency)}
                </text>
              </g>
            );
          })}

          <path
            d={path}
            fill="none"
            stroke="#2563EB"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          <circle
            cx={points[points.length - 1][0]}
            cy={points[points.length - 1][1]}
            fill="#FFFFFF"
            r="5"
            stroke="#2563EB"
            strokeWidth="3"
          />

          {stock.symbol === "AAPL" && (
            <g>
              <circle cx={points[points.length - 1][0] - 14} cy={points[points.length - 1][1] - 3} fill="#DC2626" r="5" />
              <text fill="#991B1B" fontSize="12" fontWeight="600" x={points[points.length - 1][0] - 100} y={points[points.length - 1][1] - 12}>
                알림 조건 충족
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-default px-3 py-2 text-xs text-text-muted">
        <span>최신 가격은 차트 밖의 현재가 영역에서도 확인할 수 있습니다.</span>
        <span className="tabular">Provider: {stock.provider}</span>
      </div>
    </div>
  );
}

function AlertPanel({
  alerts,
  form,
  formError,
  onAcknowledgeAll,
  onAcknowledgeAlert,
  onFormChange,
  onRuleSubmit,
  onToggleRule,
  rules,
  selectedStock,
}) {
  const pendingAlertCount = alerts.filter((alert) => !alert.acknowledgedAt).length;

  return (
    <div className="space-y-4">
      <Panel title="알림 규칙" icon={<Bell aria-hidden="true" size={18} />}>
        <form className="space-y-3" onSubmit={onRuleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Field label="규칙 종류" htmlFor="rule-type">
              <Select
                id="rule-type"
                value={form.ruleType}
                onChange={(value) => onFormChange((current) => ({ ...current, ruleType: value }))}
              >
                <option value="price">가격</option>
                <option value="daily_change_percent">일일 등락률</option>
              </Select>
            </Field>

            <Field label="조건" htmlFor="operator">
              <Select
                id="operator"
                value={form.operator}
                onChange={(value) => onFormChange((current) => ({ ...current, operator: value }))}
              >
                <option value="above">설정값 이상</option>
                <option value="below">설정값 이하</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <Field label="설정값" htmlFor="threshold-value">
              <input
                className="focus-ring h-10 w-full rounded-md border border-border-default bg-bg-surface px-3 text-sm tabular"
                id="threshold-value"
                inputMode="decimal"
                onChange={(event) =>
                  onFormChange((current) => ({ ...current, thresholdValue: event.target.value }))
                }
                placeholder={form.ruleType === "price" ? selectedStock.currency : "%"}
                type="number"
                value={form.thresholdValue}
              />
            </Field>

            <Field label="쿨다운(분)" htmlFor="cooldown-minutes">
              <input
                className="focus-ring h-10 w-full rounded-md border border-border-default bg-bg-surface px-3 text-sm tabular"
                id="cooldown-minutes"
                min="0"
                onChange={(event) =>
                  onFormChange((current) => ({ ...current, cooldownMinutes: event.target.value }))
                }
                type="number"
                value={form.cooldownMinutes}
              />
            </Field>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface-muted px-3 py-2 text-sm">
            <span>
              <span className="font-medium text-text-secondary">규칙 활성화</span>
              <span className="block text-xs text-text-muted">꺼짐 상태의 규칙은 평가하지 않습니다.</span>
            </span>
            <input
              checked={form.enabled}
              className="size-4 accent-monitoring-active"
              onChange={(event) =>
                onFormChange((current) => ({ ...current, enabled: event.target.checked }))
              }
              type="checkbox"
            />
          </label>

          {formError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-alert-triggered" role="alert">
              {formError}
            </p>
          )}

          <button
            className="focus-ring inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-4 text-sm font-semibold text-bg-surface transition hover:bg-brand-primary-hover"
            type="submit"
          >
            <Plus aria-hidden="true" size={17} />
            Save rule
          </button>
        </form>
      </Panel>

      <Panel title="규칙 상태" icon={<Clock3 aria-hidden="true" size={18} />}>
        {rules.length === 0 ? (
          <EmptyState title="아직 알림 규칙이 없습니다" description="위 폼에서 새 규칙을 저장하세요." />
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} stock={selectedStock} onToggle={onToggleRule} />
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="최근 알림"
        icon={<BellRing aria-hidden="true" size={18} />}
        actions={
          pendingAlertCount > 0 ? (
            <button
              className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border-default bg-bg-surface px-2.5 text-xs font-semibold text-text-secondary transition hover:border-border-strong hover:bg-bg-surface-muted"
              onClick={onAcknowledgeAll}
              type="button"
            >
              <Check aria-hidden="true" size={14} />
              모두 확인
            </button>
          ) : null
        }
      >
        {alerts.length === 0 ? (
          <EmptyState title="최근 알림이 없습니다" description="조건이 충족되면 이 영역에 기록됩니다." />
        ) : (
          <div aria-live="polite" className="space-y-2">
            {alerts.map((alert) => {
              const acknowledged = Boolean(alert.acknowledgedAt);

              return (
                <div
                  className={`rounded-lg border px-3 py-3 ${
                    acknowledged
                      ? "border-border-default bg-bg-surface-muted text-text-muted"
                      : "border-red-200 bg-red-50 text-text-primary"
                  }`}
                  key={alert.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="tabular rounded-md bg-bg-surface px-1.5 py-0.5 text-xs font-semibold text-text-secondary">
                          {alert.symbol}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                            acknowledged
                              ? "bg-bg-surface text-text-muted"
                              : "bg-red-100 text-alert-triggered"
                          }`}
                        >
                          {acknowledged ? "확인됨" : "미확인"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{alert.message}</p>
                      <p className="tabular mt-1 text-xs text-text-muted">
                        {alert.triggeredValue} · 발생 {formatRelativeTime(alert.createdAt)}
                      </p>
                      {acknowledged && (
                        <p className="tabular mt-1 text-xs text-text-muted">
                          확인 {formatRelativeTime(alert.acknowledgedAt)}
                        </p>
                      )}
                    </div>
                    {!acknowledged && (
                      <button
                        className="focus-ring h-8 shrink-0 rounded-md border border-red-200 bg-bg-surface px-2 text-xs font-semibold text-alert-triggered transition hover:bg-red-100"
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        type="button"
                      >
                        확인
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function RuleRow({ onToggle, rule, stock }) {
  const condition = `${rule.ruleType === "price" ? "가격" : "일일 등락률"} ${
    rule.operator === "above" ? "설정값 이상" : "설정값 이하"
  }`;
  const value =
    rule.ruleType === "price"
      ? formatPrice(rule.thresholdValue, stock.currency)
      : `${rule.thresholdValue}%`;
  const lastTriggeredLabel = formatRelativeTime(rule.lastTriggeredAt);

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{condition}</p>
          <p className="tabular mt-1 text-sm text-text-secondary">{value}</p>
          <p className="mt-1 text-xs text-text-muted">
            쿨다운 {rule.cooldownMinutes}분
            {lastTriggeredLabel ? ` · 마지막 충족 ${lastTriggeredLabel}` : ""}
          </p>
        </div>
        <button
          aria-pressed={rule.enabled}
          className={`focus-ring h-8 rounded-md border px-2 text-xs font-semibold transition ${
            rule.enabled
              ? "border-emerald-200 bg-emerald-50 text-monitoring-active"
              : "border-border-default bg-bg-surface-muted text-text-muted"
          }`}
          onClick={() => onToggle(rule.id)}
          type="button"
        >
          {rule.enabled ? "켜짐" : "꺼짐"}
        </button>
      </div>
    </div>
  );
}

function Panel({ actions = null, children, className = "", icon, title }) {
  return (
    <section className={`rounded-lg border border-border-default bg-bg-surface p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3 text-text-primary">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h2 className="text-base font-semibold leading-6">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Field({ children, htmlFor, label }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1 block text-sm font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function Select({ children, id, onChange, value }) {
  return (
    <div className="relative">
      <select
        className="focus-ring h-10 w-full appearance-none rounded-md border border-border-default bg-bg-surface px-3 pr-9 text-sm text-text-primary"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        size={17}
      />
    </div>
  );
}

function IconButton({ children, disabled = false, label, onClick, title }) {
  return (
    <button
      aria-label={label}
      className="focus-ring inline-flex size-10 items-center justify-center rounded-md border border-border-default bg-bg-surface text-text-secondary transition hover:border-border-strong hover:bg-bg-surface-muted disabled:bg-bg-surface-muted disabled:text-text-subtle"
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function InlineStatus({ icon, label, tone, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex size-8 items-center justify-center rounded-md ${toneClass(tone)}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-text-muted">{label}</div>
        <div className="truncate text-sm font-semibold text-text-primary">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ children, tone }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold ${toneClass(tone)}`}
    >
      {children}
    </span>
  );
}

function EmptyState({ description, title }) {
  return (
    <div className="rounded-lg border border-dashed border-border-default bg-bg-surface-muted px-3 py-5 text-center">
      <p className="text-sm font-semibold text-text-secondary">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  );
}

function PriceChange({ compact = false, stock }) {
  const isPositive = stock.change >= 0;
  const colorClass = isPositive ? "text-success" : "text-alert-triggered";
  const sign = isPositive ? "+" : "";

  return (
    <div className={`tabular ${compact ? "text-right text-xs" : "text-sm"} ${colorClass}`}>
      <div className="font-semibold">
        {sign}
        {formatCompact(stock.change, stock.currency)}
      </div>
      <div>
        {sign}
        {stock.changePercent.toFixed(2)}%
      </div>
    </div>
  );
}

function toneClass(tone) {
  const tones = {
    active: "bg-emerald-50 text-monitoring-active",
    info: "bg-blue-50 text-brand-primary",
    sample: "bg-violet-50 text-sample",
    warning: "bg-amber-50 text-warning",
  };

  return tones[tone] ?? tones.info;
}

function formatPrice(value, currency) {
  return new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(value);
}

function formatCompact(value, currency) {
  return new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(value);
}

function formatRelativeTime(value, now = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "방금";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.floor(diffHours / 24)}일 전`;
}

function notificationButtonLabel(status) {
  const labels = {
    denied: "브라우저 알림 차단됨",
    granted: "브라우저 알림 켜짐",
    needed: "브라우저 알림 켜기",
    unsupported: "브라우저 알림 미지원",
  };

  return labels[status] ?? labels.needed;
}

function notificationStatusLabel(status) {
  const labels = {
    denied: "브라우저 알림 차단 · 인앱 알림 활성",
    granted: "브라우저 알림 켜짐",
    needed: "인앱 알림 우선",
    unsupported: "브라우저 알림 미지원",
  };

  return labels[status] ?? labels.needed;
}

function notificationStatusTone(status) {
  if (status === "granted") {
    return "active";
  }

  if (status === "denied" || status === "unsupported") {
    return "warning";
  }

  return "info";
}

export default App;
