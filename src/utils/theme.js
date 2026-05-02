export function applyTheme(theme) {
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme || 'light';
  document.documentElement.setAttribute('data-theme', resolved);
}
