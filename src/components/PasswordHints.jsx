import React from 'react';
import { useTranslation } from 'react-i18next';
import { PASSWORD_RULES } from '../utils/password';
import '../styles/components/PasswordHints.scss';

const PasswordHints = ({ password }) => {
  const { t } = useTranslation();

  return (
    <ul className="pw-hints">
      {PASSWORD_RULES.map(({ key, test }) => {
        const ok = test(password);
        return (
          <li key={key} className={`pw-hints__item${ok ? ' pw-hints__item--ok' : ''}`}>
            <span className="pw-hints__mark" aria-hidden="true">{ok ? '✓' : '•'}</span>
            {t(key)}
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordHints;
