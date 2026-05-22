const storageKeys = {
  subjects: "pr9-subjects",
  grades: "pr9-grades",
  theme: "pr9-theme",
};

const defaultSubjects = [
  "JavaScript",
  "HTML та CSS",
  "UI/UX дизайн",
  "Алгоритми",
];

const defaultGrades = [
  "Модуль 1 — 95 балів",
  "Лабораторна робота — 12/12",
  "Контрольна робота — 48/50",
];

const subjectForm = document.getElementById("subjectForm");
const subjectInput = document.getElementById("subjectInput");
const searchInput = document.getElementById("searchInput");
const subjectList = document.getElementById("subjectList");
const sortSubjectsButton = document.getElementById("sortSubjects");
const gradeForm = document.getElementById("gradeForm");
const gradeInput = document.getElementById("gradeInput");
const gradeList = document.getElementById("gradeList");
const themeToggle = document.getElementById("themeToggle");

let subjects = loadList(storageKeys.subjects, defaultSubjects);
let grades = loadList(storageKeys.grades, defaultGrades);
let activeTheme = localStorage.getItem(storageKeys.theme) || "light";
let isSorted = false;

function loadList(storageKey, fallback) {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [...fallback];
  } catch {
    return [...fallback];
  }
}

function saveList(storageKey, values) {
  localStorage.setItem(storageKey, JSON.stringify(values));
}

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function createItemElement(text, options = {}) {
  const item = document.createElement("li");
  item.className = "item";

  const title = document.createElement("div");
  title.className = "item-title";
  title.textContent = text;
  item.append(title);

  if (options.removable) {
    const actions = document.createElement("div");
    actions.className = "item-actions";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "icon-button danger";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Видалити ${text}`);
    removeButton.addEventListener("click", () => {
      const confirmed = confirm(`Ви впевнені, що хочете видалити «${text}»?`);
      if (confirmed && typeof options.onRemove === "function") {
        options.onRemove();
      }
    });

    actions.append(removeButton);
    item.append(actions);
  }

  return item;
}

function renderSubjects() {
  const query = normalizeText(searchInput.value);
  const visibleSubjects = subjects.filter((subject) => subject.toLowerCase().includes(query));

  subjectList.innerHTML = "";

  if (visibleSubjects.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "Нічого не знайдено.";
    subjectList.append(emptyState);
    return;
  }

  visibleSubjects.forEach((subject, visibleIndex) => {
    const item = createItemElement(subject, {
      removable: true,
      onRemove: () => removeSubject(subjects.indexOf(visibleSubjects[visibleIndex])),
    });
    subjectList.append(item);
  });
}

function renderGrades() {
  gradeList.innerHTML = "";

  if (grades.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "Поки що немає жодного результату.";
    gradeList.append(emptyState);
    return;
  }

  grades.forEach((grade, index) => {
    const item = createItemElement(grade, {
      removable: true,
      onRemove: () => removeGrade(index),
    });
    gradeList.append(item);
  });
}

function removeSubject(index) {
  if (index < 0) {
    return;
  }

  subjects.splice(index, 1);
  saveList(storageKeys.subjects, subjects);
  renderSubjects();
}

function removeGrade(index) {
  grades.splice(index, 1);
  saveList(storageKeys.grades, grades);
  renderGrades();
}

subjectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = subjectInput.value.trim();

  if (!value) {
    return;
  }

  subjects.push(value);

  if (isSorted) {
    subjects.sort((first, second) => first.localeCompare(second, "uk"));
  }

  saveList(storageKeys.subjects, subjects);
  subjectInput.value = "";
  renderSubjects();
});

gradeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = gradeInput.value.trim();

  if (!value) {
    return;
  }

  grades.push(value);
  saveList(storageKeys.grades, grades);
  gradeInput.value = "";
  renderGrades();
});

searchInput.addEventListener("input", renderSubjects);

sortSubjectsButton.addEventListener("click", () => {
  subjects.sort((first, second) => first.localeCompare(second, "uk"));
  isSorted = true;
  saveList(storageKeys.subjects, subjects);
  renderSubjects();
});

function applyTheme(theme) {
  activeTheme = theme;
  document.documentElement.dataset.theme = theme === "dark" ? "dark" : "light";
  themeToggle.textContent = theme === "dark" ? "Світла тема" : "Темна тема";
  localStorage.setItem(storageKeys.theme, theme);
}

themeToggle.addEventListener("click", () => {
  applyTheme(activeTheme === "dark" ? "light" : "dark");
});

applyTheme(activeTheme);
renderSubjects();
renderGrades();
