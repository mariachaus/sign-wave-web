export function applyTheme(theme) {
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme || 'light';
  document.documentElement.setAttribute('data-theme', resolved);
}

export function applyFontSize(scale) {
  const s = parseFloat(scale) || 1.0;
  document.documentElement.style.fontSize = Math.round(s * 100) + '%';
}
