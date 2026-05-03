const calendarRoot = document.querySelector("#mini-calendar");
const agendaPanel = document.querySelector("#agenda-panel");
const sidebar = document.querySelector(".calendar-sidebar");
const monthTitle = document.querySelector("#month-title");
const selectedDateLabel = document.querySelector("#selected-date-label");
const statusBanner = document.querySelector("#status-banner");
const eventForm = document.querySelector("#event-form");
const eventTitleInput = document.querySelector("#event-title");
const eventStartTimeInput = document.querySelector("#event-start-time");
const eventCategorySelect = document.querySelector("#event-category");
const saveEventButton = document.querySelector("#save-event-button");
const previousMonthButton = document.querySelector("#previous-month-button");
const nextMonthButton = document.querySelector("#next-month-button");
const captchaPanel = document.querySelector("#captcha-panel");
const captchaHelp = document.querySelector("#captcha-help");
const captchaWidget = document.querySelector("#captcha-widget");

const month = createMonthStateFromDate(getTodayIsoDate());

const weekDays = ["m", "t", "w", "t", "f", "s", "s"];

const eventStyles = {
  green: { dot: "#86dcae", text: "#2c5a41" },
  red: { dot: "#e23939", text: "#be1a1a" },
  gold: { dot: "#f0c34e", text: "#684d08" },
  mint: { dot: "#57ce8d", text: "#3ba86e" },
  violet: { dot: "#a16cff", text: "#341d76" },
  blue: { dot: "#4c5cff", text: "#2937b5" },
};

const fallbackCategories = [
  { id: "", name: "No category", color_key: "green" },
];

const state = {
  selectedDate: getTodayIsoDate(),
  categories: [],
  events: [],
  isLoading: false,
  isSaving: false,
  status: null,
  supabaseClient: null,
  userId: null,
  canUseSupabase: false,
  captcha: null,
  captchaToken: "",
  captchaWidgetId: null,
  isAuthenticating: false,
};

window.FIGMA_CALENDAR_DEBUG = {
  authStatus: "idle",
  lastAuthErrorCode: "",
  lastAuthErrorMessage: "",
  lastCaptchaEvent: "",
};

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const monthValue = String(today.getMonth() + 1).padStart(2, "0");
  const dayValue = String(today.getDate()).padStart(2, "0");
  return `${year}-${monthValue}-${dayValue}`;
}

function parseIsoDate(isoDate) {
  const [year, monthValue, dayValue] = isoDate.split("-").map(Number);
  return {
    year,
    monthIndex: monthValue - 1,
    day: dayValue,
  };
}

function toIsoDate(year, monthIndex, day) {
  const date = new Date(Date.UTC(year, monthIndex, day));
  const valueYear = date.getUTCFullYear();
  const valueMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const valueDay = String(date.getUTCDate()).padStart(2, "0");
  return `${valueYear}-${valueMonth}-${valueDay}`;
}

function getDaysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function createMonthState(year, monthIndex) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const normalizedYear = firstDay.getUTCFullYear();
  const normalizedMonthIndex = firstDay.getUTCMonth();
  const lastDay = getDaysInMonth(normalizedYear, normalizedMonthIndex);
  const label = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(firstDay);

  return {
    year: normalizedYear,
    index: normalizedMonthIndex,
    label,
    startDate: toIsoDate(normalizedYear, normalizedMonthIndex, 1),
    endDate: toIsoDate(normalizedYear, normalizedMonthIndex, lastDay),
  };
}

function createMonthStateFromDate(isoDate) {
  const date = parseIsoDate(isoDate);
  return createMonthState(date.year, date.monthIndex);
}

function setVisibleMonth(year, monthIndex) {
  Object.assign(month, createMonthState(year, monthIndex));
}

function setVisibleMonthFromDate(isoDate) {
  const date = parseIsoDate(isoDate);
  setVisibleMonth(date.year, date.monthIndex);
}

function formatDateLabel(isoDate) {
  const [year, monthValue, dayValue] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthValue - 1, dayValue));

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatFullDate(isoDate) {
  const [year, monthValue, dayValue] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthValue - 1, dayValue));

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(value) {
  if (!value) {
    return "All day";
  }

  return value.slice(0, 5);
}

function createDayLabel(label) {
  const item = document.createElement("div");
  item.className = "day-label";
  item.textContent = label;
  return item;
}

function buildMonthCells() {
  const firstDay = new Date(Date.UTC(month.year, month.index, 1));
  const lastDay = new Date(Date.UTC(month.year, month.index + 1, 0));
  const mondayIndex = (firstDay.getUTCDay() + 6) % 7;
  const totalDays = lastDay.getUTCDate();
  const totalCells = Math.ceil((mondayIndex + totalDays) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - mondayIndex + 1;
    const cellDate = new Date(Date.UTC(month.year, month.index, dayOffset));
    const isCurrentMonth = cellDate.getUTCMonth() === month.index;

    return {
      date: toIsoDate(
        cellDate.getUTCFullYear(),
        cellDate.getUTCMonth(),
        cellDate.getUTCDate(),
      ),
      label: String(cellDate.getUTCDate()).padStart(2, "0"),
      isCurrentMonth,
    };
  });
}

function hasEventsForDate(date) {
  return state.events.some((event) => event.event_date === date);
}

function createDateButton(cell) {
  const button = document.createElement("button");
  const isSelected = cell.date === state.selectedDate;
  button.className = "calendar-date";
  button.type = "button";
  button.dataset.date = cell.date;
  button.setAttribute("aria-label", formatFullDate(cell.date));
  button.setAttribute("aria-pressed", String(isSelected));

  if (isSelected) {
    button.classList.add("is-selected");
  }

  if (!cell.isCurrentMonth) {
    button.classList.add("is-muted");
    button.setAttribute("aria-disabled", "true");
  }

  const inner = document.createElement("span");
  inner.className = "calendar-date__inner";
  inner.textContent = cell.label;
  button.append(inner);

  if (cell.isCurrentMonth && hasEventsForDate(cell.date)) {
    const marker = document.createElement("span");
    marker.className = "calendar-date__marker";
    marker.setAttribute("aria-hidden", "true");
    button.append(marker);
  }

  button.addEventListener("click", () => {
    if (!cell.isCurrentMonth) {
      return;
    }

    state.selectedDate = cell.date;
    renderCalendar();
    renderSelectedDate();
    renderAgenda();
  });

  return button;
}

function renderCalendar() {
  const labels = weekDays.map(createDayLabel);
  const dates = buildMonthCells().map(createDateButton);
  monthTitle.textContent = month.label;
  sidebar.setAttribute("aria-label", `${month.label} calendar`);
  calendarRoot.setAttribute("aria-label", month.label);
  calendarRoot.replaceChildren(...labels, ...dates);
}

function renderSelectedDate() {
  selectedDateLabel.textContent = formatDateLabel(state.selectedDate);
}

function getCategoryById(categoryId) {
  return state.categories.find((category) => category.id === categoryId);
}

function getCategoryStyle(event) {
  const colorKey =
    event.schedule_categories?.color_key ||
    getCategoryById(event.category_id)?.color_key ||
    "green";

  return {
    key: colorKey,
    style: eventStyles[colorKey] || eventStyles.green,
  };
}

function createEventRow(event) {
  const { key, style } = getCategoryStyle(event);
  const item = document.createElement("li");
  item.className = "event-row";
  item.style.setProperty("--event-dot", style.dot);
  item.style.setProperty("--event-text", style.text);

  const info = document.createElement("span");
  info.className = "event-info";

  const dot = document.createElement("span");
  dot.className = "event-dot";
  dot.setAttribute("aria-hidden", "true");

  const name = document.createElement("span");
  name.className = "event-name";
  name.textContent = event.title;

  const category = document.createElement("span");
  category.className = "event-category";
  category.textContent = event.schedule_categories?.name || key;

  const time = document.createElement("span");
  time.className = "event-time";
  time.textContent = formatTime(event.start_time);

  info.append(dot, name, category);
  item.append(info, time);
  return item;
}

function renderLoadingState() {
  const title = document.createElement("h3");
  title.className = "empty-title";
  title.textContent = "Events";

  const copy = document.createElement("p");
  copy.className = "empty-copy";
  copy.textContent = "Loading events...";

  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";
  wrapper.append(copy);

  agendaPanel.replaceChildren(title, wrapper);
}

function renderEmptyState() {
  const title = document.createElement("h3");
  title.className = "empty-title";
  title.textContent = "Events";

  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  const copy = document.createElement("p");
  copy.className = "empty-copy";
  copy.textContent = `No events for ${formatDateLabel(state.selectedDate)}`;

  emptyState.append(copy);
  agendaPanel.replaceChildren(title, emptyState);
}

function renderAgenda() {
  if (state.isLoading) {
    agendaPanel.classList.add("is-empty");
    renderLoadingState();
    return;
  }

  const selectedEvents = state.events
    .filter((event) => event.event_date === state.selectedDate)
    .sort((left, right) =>
      String(left.start_time || "").localeCompare(String(right.start_time || "")),
    );

  agendaPanel.classList.toggle("is-empty", selectedEvents.length === 0);
  sidebar.dataset.sourceNode = selectedEvents.length === 0 ? "10:89885" : "1:901";

  if (selectedEvents.length === 0) {
    renderEmptyState();
    return;
  }

  const wrapper = document.createElement("section");
  wrapper.className = "agenda-section";
  wrapper.setAttribute("aria-label", `Events for ${formatDateLabel(state.selectedDate)}`);

  const heading = document.createElement("div");
  heading.className = "agenda-heading";

  const title = document.createElement("h3");
  title.textContent = formatDateLabel(state.selectedDate);

  const count = document.createElement("span");
  count.className = "agenda-count";
  count.textContent = String(selectedEvents.length);

  const list = document.createElement("ul");
  list.className = "event-list";
  list.append(...selectedEvents.map(createEventRow));

  heading.append(title, count);
  wrapper.append(heading, list);
  agendaPanel.replaceChildren(wrapper);
}

function setStatus(tone, message) {
  state.status = message ? { tone, message } : null;
  renderStatus();
}

function renderStatus() {
  if (!state.status) {
    statusBanner.hidden = true;
    statusBanner.textContent = "";
    statusBanner.dataset.tone = "";
    return;
  }

  statusBanner.hidden = false;
  statusBanner.dataset.tone = state.status.tone;
  statusBanner.textContent = state.status.message;
}

function parseJwtPayload(key) {
  const parts = key.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(window.atob(padded));
  } catch (error) {
    return null;
  }
}

function validateSupabaseConfig() {
  const config = window.FIGMA_CALENDAR_SUPABASE;

  if (!config) {
    return {
      ok: false,
      tone: "info",
      code: "missing-config",
      message: "Supabase 설정 파일이 아직 없습니다. 달력 이동은 가능하지만 저장은 연결 후 켜집니다.",
    };
  }

  const url = String(config.url || "").trim();
  const key = String(config.publishableKey || config.anonKey || "").trim();

  if (
    !url ||
    !key ||
    url.includes("YOUR_PROJECT_REF") ||
    key.includes("YOUR_") ||
    key.includes("PASTE_")
  ) {
    return {
      ok: false,
      tone: "info",
      code: "placeholder-config",
      message: "Supabase 설정이 예시값입니다. 달력 이동은 가능하지만 저장은 연결 후 켜집니다.",
    };
  }

  if (
    key.startsWith("sb_secret_") ||
    key.toLowerCase().includes("service_role") ||
    key.startsWith("postgres://") ||
    key.startsWith("postgresql://")
  ) {
    return {
      ok: false,
      tone: "error",
      code: "blocked-secret-key",
      message: "비공개 키가 감지되어 연결을 중단했습니다.",
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return {
      ok: false,
      tone: "error",
      code: "invalid-url",
      message: "Supabase URL 형식이 올바르지 않습니다.",
    };
  }

  const isLocalHost =
    parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1";
  const isSupabaseHost = parsedUrl.hostname.endsWith(".supabase.co");

  if (parsedUrl.protocol !== "https:" && !isLocalHost) {
    return {
      ok: false,
      tone: "error",
      code: "insecure-url",
      message: "공개 브라우저 앱에는 HTTPS Supabase URL이 필요합니다.",
    };
  }

  if (!isSupabaseHost && !isLocalHost) {
    return {
      ok: false,
      tone: "error",
      code: "unexpected-host",
      message: "Supabase 프로젝트 URL만 사용할 수 있습니다.",
    };
  }

  if (key.startsWith("sb_publishable_")) {
    return { ok: true, url, key, captcha: normalizeCaptchaConfig(config.captcha) };
  }

  const jwtPayload = parseJwtPayload(key);

  if (jwtPayload?.role === "anon") {
    return { ok: true, url, key, captcha: normalizeCaptchaConfig(config.captcha) };
  }

  if (jwtPayload?.role === "service_role") {
    return {
      ok: false,
      tone: "error",
      code: "blocked-service-role",
      message: "service_role 키는 브라우저에서 사용할 수 없습니다.",
    };
  }

  return {
    ok: false,
    tone: "error",
    code: "invalid-public-key",
    message: "공개용 publishable 또는 anon key만 사용할 수 있습니다.",
  };
}

function normalizeCaptchaConfig(captcha) {
  if (!captcha) {
    return null;
  }

  const provider = String(captcha.provider || "").trim().toLowerCase();
  const siteKey = String(captcha.siteKey || "").trim();

  if (
    !siteKey ||
    siteKey.includes("YOUR_") ||
    siteKey.includes("PASTE_") ||
    siteKey.includes("CAPTCHA_SITE_KEY")
  ) {
    return { provider, siteKey: "", isPlaceholder: true };
  }

  if (provider !== "turnstile" && provider !== "hcaptcha") {
    return { provider, siteKey, isUnsupported: true };
  }

  return { provider, siteKey };
}

function setFormBusy(isBusy) {
  eventTitleInput.disabled = isBusy;
  eventStartTimeInput.disabled = isBusy;
  eventCategorySelect.disabled = isBusy;
  saveEventButton.disabled = isBusy;
}

function renderEventForm() {
  const categories = state.categories.length > 0 ? state.categories : fallbackCategories;
  eventCategorySelect.replaceChildren(
    ...categories.map((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      return option;
    }),
  );

  saveEventButton.textContent = state.isSaving ? "Saving..." : "Save";
  setFormBusy(state.isLoading || state.isSaving);
}

function renderCaptchaPanel() {
  const shouldShow = Boolean(state.captcha && !state.canUseSupabase && !state.userId);
  captchaPanel.hidden = !shouldShow;

  if (!shouldShow) {
    captchaWidget.replaceChildren();
    return;
  }

  const providerName =
    state.captcha.provider === "hcaptcha" ? "hCaptcha" : "Cloudflare Turnstile";
  captchaHelp.textContent = `${providerName} 확인을 완료하면 Supabase에 연결됩니다.`;
}

function loadScriptOnce(id, src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`#${id}`);

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Script load failed")), {
        once: true,
      });

      if (existing.dataset.loaded === "true") {
        resolve();
      }

      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error("Script load failed")));
    document.head.append(script);
  });
}

async function renderCaptchaWidget() {
  renderCaptchaPanel();

  if (!state.captcha) {
    return;
  }

  if (state.captcha.isPlaceholder) {
    setStatus("error", "CAPTCHA site key가 예시값입니다. 실제 site key를 설정해주세요.");
    return;
  }

  if (state.captcha.isUnsupported) {
    setStatus("error", "CAPTCHA provider는 turnstile 또는 hcaptcha만 지원합니다.");
    return;
  }

  captchaWidget.replaceChildren();
  state.captchaToken = "";
  state.captchaWidgetId = null;

  try {
    if (state.captcha.provider === "turnstile") {
      await loadScriptOnce(
        "figma-calendar-turnstile",
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
      );

      state.captchaWidgetId = window.turnstile.render(captchaWidget, {
        sitekey: state.captcha.siteKey,
        size: "compact",
        callback: handleCaptchaVerified,
        "expired-callback": handleCaptchaExpired,
        "error-callback": handleCaptchaError,
      });
      return;
    }

    await loadScriptOnce(
      "figma-calendar-hcaptcha",
      "https://js.hcaptcha.com/1/api.js?render=explicit",
    );

    state.captchaWidgetId = window.hcaptcha.render(captchaWidget, {
      sitekey: state.captcha.siteKey,
      size: "compact",
      callback: handleCaptchaVerified,
      "expired-callback": handleCaptchaExpired,
      "error-callback": handleCaptchaError,
    });
  } catch (error) {
    console.error("[Figma Calendar] CAPTCHA load failed:", error.message);
    setStatus("error", "CAPTCHA 위젯을 불러오지 못했습니다.");
  }
}

function resetCaptchaWidget() {
  state.captchaToken = "";

  if (state.captcha?.provider === "turnstile" && window.turnstile && state.captchaWidgetId) {
    window.turnstile.reset(state.captchaWidgetId);
    return;
  }

  if (state.captcha?.provider === "hcaptcha" && window.hcaptcha && state.captchaWidgetId) {
    window.hcaptcha.reset(state.captchaWidgetId);
  }
}

function handleCaptchaExpired() {
  state.captchaToken = "";
  window.FIGMA_CALENDAR_DEBUG.lastCaptchaEvent = "expired";
  setStatus("info", "CAPTCHA가 만료되었습니다. 다시 확인해주세요.");
}

function handleCaptchaError() {
  state.captchaToken = "";
  window.FIGMA_CALENDAR_DEBUG.lastCaptchaEvent = "error";
  setStatus("error", "CAPTCHA 확인 중 문제가 발생했습니다.");
}

function handleCaptchaVerified(token) {
  state.captchaToken = token;
  window.FIGMA_CALENDAR_DEBUG.lastCaptchaEvent = "verified";
  completeAnonymousSignIn(token).catch((error) => {
    console.error("[Figma Calendar] Anonymous auth failed:", error.message);
  });
}

async function ensureAnonymousSession() {
  const sessionResult = await state.supabaseClient.auth.getSession();

  if (sessionResult.error) {
    throw sessionResult.error;
  }

  if (sessionResult.data.session?.user?.id) {
    state.userId = sessionResult.data.session.user.id;
    return;
  }

  if (state.captcha) {
    await renderCaptchaWidget();
    setStatus("info", "CAPTCHA 확인 후 Supabase에 연결합니다.");
    return;
  }

  await completeAnonymousSignIn();
}

async function completeAnonymousSignIn(captchaToken) {
  if (state.isAuthenticating) {
    return;
  }

  state.isAuthenticating = true;
  window.FIGMA_CALENDAR_DEBUG.authStatus = "authenticating";
  window.FIGMA_CALENDAR_DEBUG.lastAuthErrorCode = "";
  window.FIGMA_CALENDAR_DEBUG.lastAuthErrorMessage = "";
  setStatus("info", "Supabase 익명 로그인을 진행하는 중입니다.");

  const credentials = captchaToken ? { options: { captchaToken } } : undefined;
  const { data, error } = await state.supabaseClient.auth.signInAnonymously(credentials);

  state.isAuthenticating = false;

  if (error) {
    window.FIGMA_CALENDAR_DEBUG.authStatus = "failed";
    window.FIGMA_CALENDAR_DEBUG.lastAuthErrorCode = error.code || "";
    window.FIGMA_CALENDAR_DEBUG.lastAuthErrorMessage = error.message || "";

    if (error.code === "captcha_failed") {
      const message = state.captcha
        ? "CAPTCHA 토큰이 거절되었습니다. Supabase CAPTCHA provider/secret key와 site key 도메인을 확인해주세요."
        : "CAPTCHA 설정이 필요합니다. supabase-config.js에 captcha 설정을 추가해주세요.";
      setStatus("error", message);
    } else {
      setStatus("error", "익명 로그인을 완료하지 못했습니다.");
    }

    resetCaptchaWidget();
    throw error;
  }

  state.userId = data.user?.id || data.session?.user?.id || null;
  state.canUseSupabase = Boolean(state.userId);
  window.FIGMA_CALENDAR_DEBUG.authStatus = state.canUseSupabase ? "authenticated" : "missing-user";
  renderCaptchaPanel();

  if (state.canUseSupabase) {
    await refreshData();
  }
}

async function loadCategories() {
  const { data, error } = await state.supabaseClient
    .from("schedule_categories")
    .select("id, name, color_key, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  state.categories = data || [];
}

async function loadEventsForMonth() {
  const { data, error } = await state.supabaseClient
    .from("schedule_events")
    .select(
      `
        id,
        title,
        event_date,
        start_time,
        end_time,
        category_id,
        status,
        notes,
        schedule_categories (
          name,
          color_key
        )
      `,
    )
    .gte("event_date", month.startDate)
    .lte("event_date", month.endDate)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }

  state.events = data || [];
}

async function refreshData() {
  state.isLoading = true;
  renderAgenda();
  renderEventForm();

  try {
    await Promise.all([loadCategories(), loadEventsForMonth()]);
    setStatus(null, "");
  } catch (error) {
    console.error("[Figma Calendar] Supabase request failed:", error.message);
    setStatus("error", "Supabase 데이터를 불러오지 못했습니다.");
  } finally {
    state.isLoading = false;
    renderCalendar();
    renderAgenda();
    renderEventForm();
  }
}

async function changeMonth(offset) {
  const selected = parseIsoDate(state.selectedDate);
  const targetMonth = createMonthState(month.year, month.index + offset);
  const targetDay = Math.min(
    selected.day,
    getDaysInMonth(targetMonth.year, targetMonth.index),
  );

  Object.assign(month, targetMonth);
  state.selectedDate = toIsoDate(targetMonth.year, targetMonth.index, targetDay);
  renderCalendar();
  renderSelectedDate();
  renderAgenda();

  if (state.canUseSupabase) {
    await refreshData();
  }
}

async function createEvent(input) {
  const payload = {
    title: input.title,
    event_date: state.selectedDate,
    start_time: input.startTime || null,
    category_id: input.categoryId || null,
    user_id: state.userId,
    status: "scheduled",
  };

  const { error } = await state.supabaseClient.from("schedule_events").insert(payload);

  if (error) {
    throw error;
  }
}

async function handleEventSubmit(event) {
  event.preventDefault();

  const title = eventTitleInput.value.trim();

  if (!title) {
    setStatus("error", "일정 제목을 입력해주세요.");
    eventTitleInput.focus();
    return;
  }

  if (!state.canUseSupabase) {
    setStatus("error", "Supabase 연결 후 일정을 저장할 수 있습니다.");
    return;
  }

  state.isSaving = true;
  renderEventForm();
  setStatus("info", "일정을 저장하는 중입니다.");

  try {
    await createEvent({
      title,
      startTime: eventStartTimeInput.value,
      categoryId: eventCategorySelect.value,
    });
    eventForm.reset();
    await refreshData();
    setStatus("success", "일정이 저장되었습니다.");
  } catch (error) {
    console.error("[Figma Calendar] Event save failed:", error.message);
    setStatus("error", "일정을 저장하지 못했습니다.");
  } finally {
    state.isSaving = false;
    renderEventForm();
  }
}

async function initializeSupabase() {
  await window.FIGMA_CALENDAR_SUPABASE_CONFIG_READY;

  const validation = validateSupabaseConfig();

  if (!validation.ok) {
    console.warn("[Figma Calendar] Supabase setup skipped:", validation.code);
    setStatus(validation.tone, validation.message);
    renderEventForm();
    return;
  }

  if (!window.supabase?.createClient) {
    setStatus("error", "Supabase JS 라이브러리를 불러오지 못했습니다.");
    renderEventForm();
    return;
  }

  state.supabaseClient = window.supabase.createClient(validation.url, validation.key, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storageKey: "figma-calendar-auth-v1",
    },
  });
  state.captcha = validation.captcha;

  try {
    setStatus("info", "Supabase에 연결하는 중입니다.");
    await ensureAnonymousSession();

    if (state.userId) {
      state.canUseSupabase = true;
      await refreshData();
    }
  } catch (error) {
    console.error("[Figma Calendar] Anonymous auth failed:", error.message);
    state.canUseSupabase = false;
    if (state.status?.tone === "error") {
      renderStatus();
    } else if (error.code === "captcha_failed") {
      setStatus("error", "CAPTCHA 설정이 필요합니다. supabase-config.js에 captcha 설정을 추가해주세요.");
    } else {
      setStatus("error", "익명 로그인을 완료하지 못했습니다.");
    }
    renderEventForm();
  }
}

eventForm.addEventListener("submit", handleEventSubmit);
previousMonthButton.addEventListener("click", () => {
  changeMonth(-1);
});
nextMonthButton.addEventListener("click", () => {
  changeMonth(1);
});

setVisibleMonthFromDate(state.selectedDate);
renderCalendar();
renderSelectedDate();
renderAgenda();
renderEventForm();
initializeSupabase();
