import i18n from '../i18n';

// Backend error format (see exception handlers in sign-wave-backend/server.py):
//   HTTPException → { error: "message" }
//   429           → rate limited, Retry-After header carries the wait in seconds
//   422           → { error: "Validation error", details: [{ msg, ... }] }
export const getApiErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (err.response?.status === 429) {
    // Retry-After (seconds) is exposed by the backend CORS config; default to the full 15 min window
    const seconds = Number(err.response.headers?.['retry-after']) || 900;
    return i18n.t('rate_limited', { minutes: Math.ceil(seconds / 60) });
  }
  if (Array.isArray(data?.details) && data.details.length) {
    return data.details.map(d => String(d.msg || '').replace(/^Value error, /, '')).join('. ');
  }
  if (typeof data?.error === 'string') return data.error;
  return fallback;
};
