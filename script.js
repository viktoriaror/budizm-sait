const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const themeButton = document.querySelector(".theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeButton.setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  themeButton.setAttribute("title", isDark ? "Включить светлую тему" : "Включить тёмную тему");
  themeMeta.setAttribute("content", isDark ? "#202923" : "#faf8f2");
}

let savedTheme;
try {
  savedTheme = window.localStorage.getItem("quiet-path-theme");
} catch (error) {
  console.warn("Не удалось прочитать сохранённую тему оформления.", error);
}
setTheme(savedTheme === "dark" ? "dark" : "light");

const textSizeButton = document.querySelector(".text-size-toggle");
let savedTextSize;
try {
  savedTextSize = window.localStorage.getItem("quiet-path-large-text") === "true";
} catch (error) {
  console.warn("Не удалось прочитать настройку размера текста.", error);
}

function setLargeText(isEnabled) {
  document.documentElement.classList.toggle("large-text", isEnabled);
  textSizeButton.setAttribute("aria-pressed", String(isEnabled));
  textSizeButton.setAttribute(
    "aria-label",
    isEnabled ? "Выключить увеличенный текст" : "Увеличить размер текста",
  );
  textSizeButton.setAttribute(
    "title",
    isEnabled ? "Выключить увеличенный текст" : "Увеличить размер текста",
  );
}

setLargeText(savedTextSize);
textSizeButton.addEventListener("click", () => {
  const isEnabled = textSizeButton.getAttribute("aria-pressed") !== "true";
  setLargeText(isEnabled);
  try {
    window.localStorage.setItem("quiet-path-large-text", String(isEnabled));
  } catch (error) {
    console.warn("Не удалось сохранить настройку размера текста.", error);
  }
});

themeButton.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  try {
    window.localStorage.setItem("quiet-path-theme", nextTheme);
  } catch (error) {
    console.warn("Не удалось сохранить выбранную тему оформления.", error);
  }
});

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
    navigation.classList.remove("is-open");
  });
});

const sections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-25% 0px -60% 0px" },
  );
  sections.forEach((section) => sectionObserver.observe(section));

  const revealTargets = document.querySelectorAll(
    ".intro-grid, .stats-row, .section-heading, .truth-card, .traditions-top, .flip-card, .festivals-heading, .festival-feature, .festival-item, .festival-footnote, .extra-topic-heading, .path-item, .symbol-card, .place-card, .daily-idea, .daily-photo, .quiz-score, .quiz-card, .practice-content",
  );
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("js-ready");
    revealTargets.forEach((target) => target.classList.add("reveal"));
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    revealTargets.forEach((target) => revealObserver.observe(target));
  }
}

document.querySelectorAll(".flip-card").forEach((card) => {
  card.addEventListener("click", () => {
    const isFlipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", String(isFlipped));
  });
});

document.querySelectorAll(".festival-arrow").forEach((button) => {
  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    const details = document.getElementById(button.getAttribute("aria-controls"));
    if (!details) {
      console.error(`Не найден блок с подробностями праздника: ${button.getAttribute("aria-controls")}`);
      return;
    }
    button.setAttribute("aria-expanded", String(!isExpanded));
    details.hidden = isExpanded;
  });
});

document.querySelectorAll(".symbol-card").forEach((card) => {
  card.addEventListener("click", () => {
    const isFlipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", String(isFlipped));
    document.querySelectorAll(".symbol-card").forEach((otherCard) => {
      if (otherCard === card) return;
      otherCard.classList.remove("is-flipped");
      otherCard.setAttribute("aria-pressed", "false");
    });
  });
});

const dailyIdeas = [...document.querySelectorAll(".daily-idea")];
const dailyProgress = document.querySelector(".daily-progress strong");

function updateDailyProgress() {
  const completed = dailyIdeas.filter((idea) => idea.getAttribute("aria-pressed") === "true").length;
  dailyProgress.textContent = `${completed} из ${dailyIdeas.length}`;
}

dailyIdeas.forEach((idea) => {
  idea.addEventListener("click", () => {
    const isSelected = idea.getAttribute("aria-pressed") === "true";
    idea.setAttribute("aria-pressed", String(!isSelected));
    idea.querySelector(".idea-check").textContent = isSelected ? "○" : "✓";
    updateDailyProgress();
  });
});

const quizCards = [...document.querySelectorAll(".quiz-card")];
const quizScore = document.querySelector(".quiz-score-text strong");
const quizReset = document.querySelector(".quiz-reset");

function updateQuizScore() {
  const answeredCards = quizCards.filter((card) => card.dataset.choice);
  const correctAnswers = answeredCards.filter((card) => card.dataset.choice === card.dataset.answer).length;
  quizScore.textContent = `${correctAnswers} из ${answeredCards.length}`;
  quizReset.hidden = answeredCards.length === 0;
  if (answeredCards.length === quizCards.length) {
    quizScore.textContent = `${correctAnswers} из ${quizCards.length} — ${
      correctAnswers === quizCards.length ? "отлично!" : "хорошая работа!"
    }`;
  }
}

quizCards.forEach((card) => {
  card.querySelectorAll(".quiz-choices button").forEach((button) => {
    button.addEventListener("click", () => {
      if (card.dataset.choice) return;
      const choice = button.dataset.choice;
      card.dataset.choice = choice;
      const isCorrect = choice === card.dataset.answer;
      button.classList.add(isCorrect ? "is-correct" : "is-incorrect");
      button.setAttribute("aria-pressed", "true");
      card.querySelectorAll(".quiz-choices button").forEach((option) => {
        option.disabled = true;
        if (option.dataset.choice === card.dataset.answer) option.classList.add("is-correct");
      });
      card.querySelector(".quiz-feedback").hidden = false;
      updateQuizScore();
    });
  });
});

quizReset.addEventListener("click", () => {
  quizCards.forEach((card) => {
    delete card.dataset.choice;
    card.querySelector(".quiz-feedback").hidden = true;
    card.querySelectorAll(".quiz-choices button").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-correct", "is-incorrect");
      button.removeAttribute("aria-pressed");
    });
  });
  updateQuizScore();
  quizCards[0].scrollIntoView({ block: "center" });
});

const timerDisplay = document.querySelector(".timer-display");
const timerButton = document.querySelector(".timer-button");
const timerStatus = document.querySelector(".timer-status");
const timerPresets = [...document.querySelectorAll(".timer-preset")];
let selectedDuration = 60;
let remainingSeconds = selectedDuration;
let intervalId = null;
let breathStartedAt = null;

function renderTimer() {
  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

timerButton.addEventListener("click", () => {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
    breathStartedAt = null;
    timerButton.innerHTML = 'Продолжить <span><svg class="arrow-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="M2 8h12m0 0-4-4m4 4-4 4" /></svg></span>';
    timerStatus.textContent = "ПРАКТИКА НА ПАУЗЕ";
    return;
  }

  if (remainingSeconds === 0) {
    remainingSeconds = selectedDuration;
    renderTimer();
  }

  timerButton.innerHTML = 'Пауза <span>Ⅱ</span>';
  breathStartedAt = Date.now() - ((selectedDuration - remainingSeconds) * 1000);
  intervalId = window.setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();
    const breathSecond = Math.floor((Date.now() - breathStartedAt) / 1000) % 8;
    timerStatus.textContent = breathSecond < 4 ? "ВДОХНИ · СПОКОЙНО" : "ВЫДОХНИ · МЕДЛЕННО";
    if (remainingSeconds === 0) {
      window.clearInterval(intervalId);
      intervalId = null;
      breathStartedAt = null;
      timerButton.innerHTML = 'Начать ещё раз <span><svg class="arrow-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="M12.5 5.5V2.8m0 2.7H9.8M12 5.7A5.5 5.5 0 1 0 13.3 9" /></svg></span>';
      timerStatus.textContent = "ЭТА МИНУТА — ТВОЯ";
    }
  }, 1000);
});

timerPresets.forEach((preset) => {
  preset.addEventListener("click", () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    const minutes = Number(preset.dataset.minutes);
    selectedDuration = minutes * 60;
    remainingSeconds = selectedDuration;
    breathStartedAt = null;
    renderTimer();
    timerButton.innerHTML = 'Начать практику <span><svg class="arrow-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="M2 8h12m0 0-4-4m4 4-4 4" /></svg></span>';
    timerStatus.textContent = `${minutes} ${minutes === 1 ? "МИНУТА" : "МИНУТЫ"} ДЛЯ СЕБЯ`;
    timerPresets.forEach((option) => {
      const isSelected = option === preset;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });
  });
});
