import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import emailIcon from '../../assets/images/email.svg';
import { getGatewayApiBase } from '../../utils/apiBase';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const extractErrorMessage = (response, payload, fallback) => {
  const detail = payload?.detail || payload?.message || (typeof payload === 'string' ? payload : '');

  if (response?.status === 404 || detail === 'Email not found') {
    return 'מייל זה לא נמצא במערכת.';
  }
  if (detail === 'Password reset email service is not configured') {
    return 'שירות שליחת המיילים עדיין לא מוגדר במערכת.';
  }
  if (detail === 'Failed to send password reset email') {
    return 'שליחת מייל האיפוס נכשלה. נסה שוב בעוד רגע.';
  }
  if (detail) {
    return detail;
  }
  return fallback;
};

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError('');
      setSuccess('');
      setIsSubmitting(false);
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('נא להזין כתובת מייל.');
      setSuccess('');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError('נא להזין כתובת מייל תקינה.');
      setSuccess('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getGatewayApiBase()}/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          origin: window.location.origin,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(response, data, 'לא ניתן היה לשלוח כרגע לינק לאיפוס סיסמה.')
        );
      }

      setSuccess('בדקות הקרובות יישלח לינק לאיפוס הסיסמה.');
    } catch (requestError) {
      setError(requestError?.message || 'לא ניתן היה לשלוח כרגע לינק לאיפוס סיסמה.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="forgot_password_modal_overlay"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="forgot_password_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="forgot_password_modal_close"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="סגירה"
        >
          X
        </button>

        <h2 id="forgot-password-title">שכחתי סיסמה</h2>
        <p>הזן את כתובת המייל שלך ונבדוק אם היא רשומה במערכת.</p>

        <form onSubmit={handleSubmit}>
          <div className="col_form">
            <span><img src={emailIcon} alt="" /></span>
            <input
              type="email"
              className="in"
              placeholder="אימייל"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="form_error_com">{error}</div>
          )}
          {success && (
            <div className="form_error_com form_success">{success}</div>
          )}

          <div className="forgot_password_modal_actions">
            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? 'שולח...' : 'שליחת לינק'}
            </button>
            <button
              type="button"
              className="forgot_password_modal_secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              סגירה
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ForgotPasswordModal;
