document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeToggle = document.querySelector("#themeToggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const storageKey = "portfolio-theme-v4";

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);

    if (themeColor) {
      themeColor.content = theme === "dark" ? "#111411" : "#f4f4f0";
    }

    themeToggle?.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }

  const savedTheme = localStorage.getItem(storageKey);
  setTheme(savedTheme || "light");

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
});
