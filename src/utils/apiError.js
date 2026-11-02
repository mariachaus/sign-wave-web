// Backend error format (see exception handlers in sign-wave-backend/server.py):
//   HTTPException → { error: "message" }
//   422           → { error: "Validation error", details: [{ msg, ... }] }
export const getApiErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (Array.isArray(data?.details) && data.details.length) {
    return data.details.map(d => String(d.msg || '').replace(/^Value error, /, '')).join('. ');
  }
  if (typeof data?.error === 'string') return data.error;
  return fallback;
};
