const STORAGE_KEY = "today-board-state-v1";

const defaultState = {
  focus: "",
  tasks: [],
};

const todayDate = document.querySelector("#today-date");
const focusInput = document.querySelector("#focus-input");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");

let state = loadState();

function loadState() {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (!savedState) {
    return { ...defaultState };
  }

  try {
    const parsedState = JSON.parse(savedState);

    return {
      focus: typeof parsedState.focus === "string" ? parsedState.focus : "",
      tasks: Array.isArray(parsedState.tasks) ? parsedState.tasks : [],
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createTaskId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function updateTaskCount() {
  const totalCount = state.tasks.length;
  const doneCount = state.tasks.filter((task) => task.done).length;

  if (totalCount === 0) {
    taskCount.textContent = "아직 할 일이 없어요";
    return;
  }

  taskCount.textContent = `${doneCount}개 완료 / 전체 ${totalCount}개`;
}

function renderTasks() {
  taskList.replaceChildren();
  emptyState.classList.toggle("is-hidden", state.tasks.length > 0);
  updateTaskCount();

  state.tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";
    item.classList.toggle("is-done", task.done);

    const checkbox = document.createElement("input");
    checkbox.className = "task-item__check";
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `${task.text} 완료 표시`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveState();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-item__text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "task-item__delete";
    deleteButton.type = "button";
    deleteButton.textContent = "삭제";
    deleteButton.setAttribute("aria-label", `${task.text} 삭제`);
    deleteButton.addEventListener("click", () => {
      state.tasks = state.tasks.filter((currentTask) => currentTask.id !== task.id);
      saveState();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  });
}

function addTask(text) {
  state.tasks.push({
    id: createTaskId(),
    text,
    done: false,
  });
  saveState();
  renderTasks();
}

todayDate.textContent = formatToday();
focusInput.value = state.focus;
renderTasks();

focusInput.addEventListener("input", () => {
  state.focus = focusInput.value;
  saveState();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = taskInput.value.trim();

  if (!taskText) {
    taskInput.focus();
    return;
  }

  addTask(taskText);
  taskInput.value = "";
  taskInput.focus();
});
