// 📋'd from https://flowbite.com/docs/customize/dark-mode/
if (
  localStorage.getItem("color-theme") === "dark" ||
  (!("color-theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

export function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

export function toggleTheme() {
  const nowDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("color-theme", nowDark ? "dark" : "light");
  return nowDark;
}
