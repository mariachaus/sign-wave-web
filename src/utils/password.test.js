import { describe, it, expect } from 'vitest';
import { isPasswordValid, PASSWORD_RULES } from './password';
import { getApiErrorMessage } from './apiError';

describe('isPasswordValid', () => {
  it('accepts a password with letters and digits', () => {
    expect(isPasswordValid('secret123')).toBe(true);
  });

  it('accepts cyrillic letters', () => {
    expect(isPasswordValid('пароль123')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(isPasswordValid('abc123')).toBe(false);
  });

  it('rejects passwords without a digit', () => {
    expect(isPasswordValid('onlyletters')).toBe(false);
  });

  it('rejects passwords without a letter', () => {
    expect(isPasswordValid('12345678')).toBe(false);
  });

  it('rejects passwords longer than 100 characters', () => {
    expect(isPasswordValid('a1'.repeat(51))).toBe(false);
  });
});

describe('PASSWORD_RULES', () => {
  it('reports each rule separately', () => {
    const passed = PASSWORD_RULES.filter(r => r.test('abcdefgh')).map(r => r.key);
    expect(passed).toEqual(['pw_rule_length', 'pw_rule_letter']);
  });
});

describe('getApiErrorMessage', () => {
  it('returns a string detail as is', () => {
    const err = { response: { data: { detail: 'Incorrect old password' } } };
    expect(getApiErrorMessage(err, 'fallback')).toBe('Incorrect old password');
  });

  it('joins FastAPI validation errors', () => {
    const err = { response: { data: { detail: [
      { msg: 'Value error, Password must contain at least one digit' },
    ] } } };
    expect(getApiErrorMessage(err, 'fallback')).toBe('Password must contain at least one digit');
  });

  it('falls back when there is no response', () => {
    expect(getApiErrorMessage({}, 'fallback')).toBe('fallback');
  });
});
