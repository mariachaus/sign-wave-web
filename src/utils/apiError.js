export const getApiErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map(d => String(d.msg || '').replace(/^Value error, /, '')).join('. ');
  }
  return err.response?.data?.error || fallback;
};
