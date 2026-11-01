// Must match the Password rules in sign-wave-backend/schemas.py
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

export const PASSWORD_RULES = [
  { key: 'pw_rule_length', test: (pw) => pw.length >= PASSWORD_MIN_LENGTH },
  { key: 'pw_rule_letter', test: (pw) => /\p{L}/u.test(pw) },
  { key: 'pw_rule_digit',  test: (pw) => /\p{Nd}/u.test(pw) },
];

export const isPasswordValid = (pw) =>
  pw.length <= PASSWORD_MAX_LENGTH && PASSWORD_RULES.every(rule => rule.test(pw));
