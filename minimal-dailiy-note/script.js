const STORAGE_KEY = "minimal-daily-note-entries-v1";

const diaryForm = document.querySelector("#diary-form");
const dateInput = document.querySelector("#entry-date");
const contentInput = document.querySelector("#entry-content");
const formMessage = document.querySelector("#form-message");
const entryCount = document.querySelector("#entry-count");
const emptyState = document.querySelector("#empty-state");
const entryList = document.querySelector("#entry-list");

const moodColors = {
  좋음: "좋음",
  보통: "보통",
  피곤: "피곤",
  감사: "감사",
  흐림: "흐림",
};

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

function readEntries() {
  const savedEntries = localStorage.getItem(STORAGE_KEY);

  if (!savedEntries) {
    return [];
  }

  try {
    const parsedEntries = JSON.parse(savedEntries);
    return Array.isArray(parsedEntries) ? parsedEntries : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "날짜 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function createEntryId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEntryElement(entry) {
  const item = document.createElement("li");
  item.className = "entry-item";

  const meta = document.createElement("div");
  meta.className = "entry-item__meta";

  const date = document.createElement("span");
  date.textContent = formatDate(entry.date);

  const mood = document.createElement("span");
  mood.className = "entry-item__mood";
  mood.textContent = moodColors[entry.mood] || "보통";

  const content = document.createElement("p");
  content.className = "entry-item__content";
  content.textContent = entry.content;

  meta.append(date, mood);
  item.append(meta, content);

  return item;
}

function renderEntries() {
  const entries = readEntries();
  entryList.innerHTML = "";
  entryCount.textContent = `${entries.length}개`;

  if (entries.length === 0) {
    emptyState.hidden = false;
    entryList.hidden = true;
    return;
  }

  emptyState.hidden = true;
  entryList.hidden = false;

  [...entries]
    .sort((first, second) => second.createdAt - first.createdAt)
    .forEach((entry) => {
      entryList.append(createEntryElement(entry));
    });
}

function showMessage(message, type = "error") {
  formMessage.textContent = message;
  formMessage.classList.toggle("is-success", type === "success");
}

function resetFormAfterSave() {
  diaryForm.reset();
  dateInput.value = getTodayValue();
  diaryForm.elements.mood.value = "보통";
  contentInput.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  const content = contentInput.value.trim();

  if (!content) {
    showMessage("짧아도 괜찮아요. 오늘의 문장을 먼저 적어주세요.");
    contentInput.focus();
    return;
  }

  const entries = readEntries();
  const nextEntry = {
    id: createEntryId(),
    date: dateInput.value || getTodayValue(),
    mood: diaryForm.elements.mood.value || "보통",
    content,
    createdAt: Date.now(),
  };

  saveEntries([...entries, nextEntry]);
  renderEntries();
  resetFormAfterSave();
  showMessage("일기를 저장했어요.", "success");
}

dateInput.value = getTodayValue();
diaryForm.addEventListener("submit", handleSubmit);
renderEntries();
