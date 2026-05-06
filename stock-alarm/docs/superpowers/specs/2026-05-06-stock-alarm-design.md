# Stock Alarm Design

Date: 2026-05-06
Project: `stock-alarm`

## Purpose

Build a personal stock alarm web app for monitoring US and Korean stocks while the browser is open. The app lets the user search for stocks, view latest and historical prices, save watchlist items, define alert rules, and receive browser plus in-app notifications when a rule is triggered.

This is not a trading app. It does not place orders, manage a portfolio, or provide investment advice.

## Approved Scope

- Support US and Korean stocks in the first version.
- Use near-real-time quote data suitable for market-session monitoring, subject to provider limits.
- Run alerts only while the browser app is open.
- Include a small local server so market data API keys are not exposed in browser code.
- Store watchlist items, alert rules, and alert events in Supabase.
- Use Supabase anonymous auth with row-level security.
- Use provider adapters so data providers can be swapped in future iterations without changing UI or alert logic.
- Show line charts with range selection and alert threshold lines.
- Support price above, price below, daily percent above, and daily percent below rules.
- Include cooldown/repeat protection for alerts.

## Out Of Scope

- Background alerts when the browser is closed.
- Email, SMS, push notifications from a server, or mobile push.
- Brokerage trading, order placement, account balance, or holdings sync.
- Multi-user account management beyond Supabase anonymous user separation.
- Financial advice, predictions, or recommendation logic.
- Guaranteed exchange-grade real-time delivery. Provider latency and rate limits must be visible to the user.

## Architecture

The app uses a three-part architecture:

- Frontend: React and Vite web app.
- Local server: Node and Express API proxy for market data providers.
- Storage: Supabase with anonymous auth and RLS.

The browser calls only local server endpoints for market data:

- `GET /api/search?query=&market=`
- `GET /api/quotes?symbols=`
- `GET /api/history?symbol=&range=`
- `GET /api/market-status?market=`

The local server owns external market data API credentials through `.env`. The browser never receives KIS, Alpha Vantage, Polygon, Massive, or similar provider secret keys.

Supabase access uses browser-safe publishable or anon credentials. The first version does not use a Supabase `service_role` key.

## Provider Adapter Strategy

Market data flows through a provider adapter interface. Each provider must return the same normalized shapes for search results, latest quotes, historical bars, and market status.

Initial provider candidates:

- Korean stocks: KIS Open API adapter.
- US stocks: Alpha Vantage adapter for the first real US provider.
- Fallback: demo provider with explicit "sample data" labeling.

Polygon or Massive can be added later as a stronger paid/stable US provider without changing frontend contracts.

The provider interface includes:

- `searchSymbols(query, market)`
- `getQuotes(symbols)`
- `getHistory(symbol, range)`
- `getMarketStatus(market)`

Normalized symbol records include:

- `symbol`
- `market`
- `exchange`
- `displayName`
- `currency`
- `provider`

Normalized quote records include:

- `symbol`
- `market`
- `price`
- `currency`
- `change`
- `changePercent`
- `previousClose`
- `timestamp`
- `provider`
- `isDelayed`
- `isSample`

Normalized history records include:

- `symbol`
- `range`
- `bars`, each with `time`, `open`, `high`, `low`, `close`, and optional `volume`
- `provider`
- `isSample`

## Main Screen

The first version is a single dashboard optimized for repeated personal monitoring:

- Left panel: search input and watchlist.
- Center panel: selected stock identity, latest price, chart, and range tabs.
- Right panel: alert rules and recent alert events.

Primary flow:

1. Search by US ticker, Korean stock code, or Korean company name.
2. Select a search result.
3. Review latest price and chart.
4. Add or update alert rules.
5. Let the open browser page poll quotes.
6. Receive browser and in-app notifications.
7. Review recent alert events.

On mobile, the panels stack vertically. Watchlist and alert areas should be collapsible so the selected stock and chart remain easy to inspect.

## Chart Behavior

The chart displays historical line data for the selected stock.

Supported ranges:

- `1D`
- `1W`
- `1M`
- `6M`
- `1Y`

If the selected stock has active price threshold rules, the chart overlays horizontal threshold lines. Percent-change rules are shown in the alert panel rather than as chart price lines unless their current price equivalent is available from `previousClose`.

## Supabase Data Model

All tables live in an exposed schema only with RLS enabled. Anonymous users can access only rows where `user_id = auth.uid()`.

### `watchlist_items`

Stores saved stocks.

Columns:

- `id`
- `user_id`
- `symbol`
- `market`
- `provider`
- `display_name`
- `currency`
- `exchange`
- `created_at`

Rules:

- A user should not have duplicate active rows for the same `symbol`, `market`, and `provider`.
- Deleting a watchlist item deletes its related alert rules and alert events. This keeps first-version behavior simple and avoids hidden rules for stocks no longer being watched.

### `alert_rules`

Stores alert thresholds.

Columns:

- `id`
- `watchlist_item_id`
- `user_id`
- `rule_type`
- `operator`
- `threshold_value`
- `cooldown_minutes`
- `last_triggered_at`
- `enabled`
- `created_at`
- `updated_at`

Allowed values:

- `rule_type`: `price`, `daily_change_percent`
- `operator`: `above`, `below`

Rules:

- Price rules compare latest quote `price` to `threshold_value`.
- Daily percent rules compare latest quote `changePercent` to `threshold_value`.
- Disabled rules are not evaluated.
- A triggered rule cannot trigger again until `cooldown_minutes` has passed since `last_triggered_at`.

### `alert_events`

Stores notification history.

Columns:

- `id`
- `alert_rule_id`
- `user_id`
- `symbol`
- `triggered_value`
- `message`
- `created_at`
- `acknowledged_at`

Rules:

- A new event is inserted only when a rule passes cooldown and triggers.
- Acknowledging an event updates `acknowledged_at`.

## Alert Evaluation

Alert evaluation runs in the browser because first-version alerts are active only while the page is open.

Polling behavior:

- Default quote polling interval is 60 seconds.
- The server may use a short TTL cache to avoid repeated identical provider calls.
- Provider rate-limit errors should pause or slow polling for the affected provider and show a visible status.

Evaluation flow:

1. Load watchlist and alert rules from Supabase after anonymous sign-in.
2. Request quotes for visible and watched symbols from the local server.
3. Normalize quote data.
4. Evaluate enabled rules with the latest quote.
5. If a condition is true and cooldown has passed, show in-app notification.
6. If browser Notification permission is granted, show a browser notification.
7. Insert an `alert_events` row.
8. Update `alert_rules.last_triggered_at`.

If Notification permission is denied, the app still records the event and shows in-app notifications.

## Error Handling

Configuration errors:

- Missing provider API key: show provider setup status and keep demo provider available.
- Missing Supabase config: app can show demo market data but cannot save watchlist or rules.
- Supabase anonymous auth failure: show a clear connection/auth message and block saving until resolved.

Provider errors:

- Rate limit: show a provider-limited state and retry after a longer interval.
- Network failure: keep the last successful quote visible with its timestamp.
- Unsupported symbol: show a symbol-specific error rather than failing the whole dashboard.
- Market closed: show market status and quote timestamp so stale prices are understandable.

Fallback:

- Demo provider data must be labeled as sample data in the UI.
- The app must not silently mix sample data with real provider data without showing the source.

## Component Boundaries

Frontend components:

- `SearchPanel`: search input and results.
- `Watchlist`: saved stocks and quick status.
- `StockDetail`: selected stock header and latest quote.
- `PriceChart`: historical line chart and threshold lines.
- `AlertRuleForm`: create and edit rules.
- `AlertRuleList`: enabled/disabled rules and cooldown status.
- `RecentAlerts`: alert event history.

Frontend modules:

- `stockApiClient`: local server API calls.
- `supabaseClient`: Supabase initialization and anonymous auth.
- `watchlistRepository`: watchlist persistence.
- `alertRuleRepository`: rule persistence.
- `alertEventRepository`: event persistence.
- `alertEvaluator`: pure alert condition and cooldown logic.

Server modules:

- `routes/search`
- `routes/quotes`
- `routes/history`
- `routes/marketStatus`
- `providers/kisProvider`
- `providers/usMarketProvider`
- `providers/demoProvider`
- `providers/providerTypes`
- `config/env`

Routes handle HTTP details. Providers handle external API details. The frontend must depend on normalized response shapes, not provider-specific payloads.

## Testing And Verification

Unit tests:

- `alertEvaluator` covers price above, price below, percent above, percent below, disabled rules, missing quote values, and cooldown behavior.
- Provider normalizers cover representative mock responses and error payloads.

Integration checks:

- Local server returns normalized search, quote, history, and market status shapes.
- Missing API keys produce setup errors rather than crashes.
- Demo provider lets the app run without real credentials.

Manual browser checklist:

- Anonymous Supabase sign-in succeeds.
- Search can find at least one US demo symbol and one Korean demo symbol.
- User can add a stock to the watchlist.
- User can create price and percent alert rules.
- Chart ranges switch without layout shift.
- Price threshold lines appear when price rules exist.
- Notification permission request appears at the right time.
- In-app alert appears when a demo quote crosses a rule.
- Alert event is saved to Supabase and shown in recent alerts.
- Cooldown prevents repeated alerts.
- Provider error states are visible and understandable.

## Security Notes

- Never expose provider secret keys in browser code.
- Never expose Supabase `service_role` key in browser code.
- Use Supabase RLS on every user-data table.
- RLS policies must use `auth.uid()` and not user-editable metadata.
- Browser code can use Supabase publishable or anon credentials only.
- `.env` and local credential files must stay out of git.

## Open Implementation Choices

These are intentionally deferred to the implementation plan, not left ambiguous for product behavior:

- Exact chart library, with Recharts as the default candidate unless implementation discovers a concrete incompatibility.
- Exact Supabase project connection flow for the local development environment.

## Source References Checked During Design

- KIS Open API developer portal: https://apiportal.koreainvestment.com/apiservice-apiservice%3F/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice
- Alpha Vantage API documentation: https://www.alphavantage.co/documentation/
- Polygon/Massive stock REST API overview: https://polygon.io/docs/rest/stocks/overview/
- Korea public data stock price API page: https://www.data.go.kr/en/data/15094808/openapi.do
- Korea public data listed stock information page: https://www.data.go.kr/en/data/15094775/openapi.do
