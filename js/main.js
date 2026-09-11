document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector("#themeToggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const storageKey = "portfolio-theme-v4";

  function setTheme(value) {
    const theme = value === "dark" ? "dark" : "light";
    root.dataset.theme = theme;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
    if (themeColor) themeColor.content = theme === "dark" ? "#000000" : "#ffffff";
    themeToggle?.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
    themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
  }

  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem(storageKey) || "light";
  } catch {
    // Use the default theme when storage is unavailable.
  }
  setTheme(savedTheme);
  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
});

// Scroll position controls the product illustrations; native scrolling is untouched.
(() => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stages = [...document.querySelectorAll(".project-preview")];
  let frame = 0;
  let active = false;
  const clamp = (value) => Math.min(1, Math.max(0, value));

  function render() {
    frame = 0;
    const height = window.innerHeight;
    // Read layout together before writing animation values.
    const positions = stages.map((stage) => stage.getBoundingClientRect());
    stages.forEach((stage, index) => {
      const rect = positions[index];
      if (rect.bottom < 0 || rect.top > height) return;
      const progress = clamp((height - rect.top) / (height + rect.height));
      const settle = clamp(progress / 0.55);
      stage.style.setProperty("--stage-y", `${((1 - settle) * 65).toFixed(2)}px`);
      stage.style.setProperty("--stage-scale", (0.91 + settle * 0.09).toFixed(4));
      stage.style.setProperty("--stage-angle", `${((1 - settle) * 8).toFixed(2)}deg`);
      stage.style.setProperty("--chart-offset", ((1 - settle) * 600).toFixed(2));
    });
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function syncPreference() {
    if (preference.matches) {
      active = false;
      document.documentElement.classList.remove("scroll-motion");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!active) {
      active = true;
      document.documentElement.classList.add("scroll-motion");
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    }
  }
  preference.addEventListener("change", syncPreference);
  syncPreference();
})();

// A bounded sticky scene: scrolling scrubs the story, then releases it naturally.
(() => {
  const track = document.querySelector(".quill-scroll-track");
  const scene = document.querySelector(".quill-scene");
  if (!track || !scene) return;
  const enabled = window.matchMedia("(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)");
  const root = document.documentElement;
  let frame = 0;
  const range = (p, start, end) => Math.max(0, Math.min(1, (p - start) / (end - start)));
  function render() {
    frame = 0;
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, rect.height - scene.offsetHeight);
    const progress = range(80 - rect.top, 0, travel);
    scene.style.setProperty("--quill-progress", progress.toFixed(4));
    scene.style.setProperty("--quill-zoom", range(progress, 0, 0.25).toFixed(4));
    scene.style.setProperty("--quill-question", range(progress, 0.22, 0.38).toFixed(4));
    scene.style.setProperty("--quill-answer", range(progress, 0.45, 0.62).toFixed(4));
    scene.style.setProperty("--quill-source", range(progress, 0.68, 0.85).toFixed(4));
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.toggle("quill-cinematic", enabled.matches);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (enabled.matches) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    }
  }
  enabled.addEventListener("change", sync);
  sync();
})();

// NexDerm moves from capture to analysis to a shareable doctor review.
(() => {
  const track = document.querySelector(".nexderm-scroll-track");
  const scene = document.querySelector(".nexderm-scene");
  if (!track || !scene) return;
  const enabled = window.matchMedia("(min-width: 900px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)");
  const root = document.documentElement;
  let frame = 0;
  const range = (value, start, end) => Math.max(0, Math.min(1, (value - start) / (end - start)));

  function render() {
    frame = 0;
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, rect.height - scene.offsetHeight);
    const progress = range(80 - rect.top, 0, travel);
    scene.style.setProperty("--nex-progress", progress.toFixed(4));
    scene.style.setProperty("--nex-capture", range(progress, 0.04, 0.22).toFixed(4));
    scene.style.setProperty("--nex-analyze", range(progress, 0.30, 0.52).toFixed(4));
    scene.style.setProperty("--nex-review", range(progress, 0.62, 0.84).toFixed(4));
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.toggle("nexderm-cinematic", enabled.matches);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (enabled.matches) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    }
  }

  enabled.addEventListener("change", sync);
  sync();
})();

// Copying the address works even when a visitor has no mail app configured.
document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".copy-email");
  const status = document.querySelector(".copy-status");
  if (!button || !status) return;
  const originalLabel = button.textContent.trim();
  let resetTimer = 0;

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Copy command failed");
  }

  button.addEventListener("click", async () => {
    try {
      await copyText(button.dataset.email);
      button.textContent = "Email copied";
      status.textContent = "Email address copied to clipboard.";
    } catch {
      status.textContent = "Copy failed. Select the email address above to copy it.";
      return;
    }
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      button.textContent = originalLabel;
      status.textContent = "";
    }, 2400);
  });
});
