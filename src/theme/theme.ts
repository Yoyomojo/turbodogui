export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "turbodogui-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function getStoredTheme(): ThemeMode | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(value) ? value : null;
  } catch {
    return null;
  }
}

function getPreferredTheme(): ThemeMode {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function persistTheme(theme: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
  }
}

export function setTheme(theme: ThemeMode, persist = true): void {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    persistTheme(theme);
  }
}

export function getTheme(): ThemeMode {
  const current = document.documentElement.getAttribute("data-theme");
  if (isThemeMode(current)) {
    return current;
  }

  return getStoredTheme() ?? getPreferredTheme();
}

export function initializeTheme(): ThemeMode {
  const theme = getStoredTheme() ?? getTheme();
  setTheme(theme, false);
  return theme;
}

export function toggleTheme(): ThemeMode {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
