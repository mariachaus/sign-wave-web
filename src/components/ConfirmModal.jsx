import React from 'react';
import '../styles/components/ConfirmModal.scss';

const ConfirmModal = ({ message, onConfirm, onCancel, confirmLabel, cancelLabel }) => (
  <div className="confirm-overlay" onClick={onCancel}>
    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
      <p className="confirm-modal__message">{message}</p>
      <div className="confirm-modal__actions">
        <button className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button className="confirm-modal__btn confirm-modal__btn--confirm" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
