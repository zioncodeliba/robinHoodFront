import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getGatewayApiBase } from '../utils/apiBase';

import brand from '../assets/images/logoup_m.svg';
import brandDesktop from '../assets/images/brand.svg';
import nextI from '../assets/images/next_icon.svg';
import previcon from '../assets/images/prev_icon.svg';
import leavesright from '../assets/images/leaves_right.png';
import schedulemeetingsman from '../assets/images/schedulemeetings_man.png';

const extractErrorMessage = (response, payload, fallback) => {
  const detail = payload?.detail || payload?.message || (typeof payload === 'string' ? payload : '');

  if (detail === 'Invalid or expired password reset token' || detail === 'Invalid password reset token') {
    return 'לינק האיפוס אינו תקין או שפג תוקפו.';
  }
  if (detail === 'Password must be at least 6 characters') {
    return 'הסיסמה חייבת להכיל לפחות 6 תווים.';
  }
  if (detail === 'User not found') {
    return 'לא נמצא משתמש מתאים ללינק הזה.';
  }
  if (detail) {
    return detail;
  }
  if (response?.status === 400) {
    return 'לא ניתן היה לאפס את הסיסמה עם הלינק הזה.';
  }
  return fallback;
};

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    return (params.get('token') || '').trim();
  }, [location.search]);

  const handleSubmit = async () => {
    if (!token) {
      setError('לינק האיפוס אינו תקין או חסר.');
      setSuccess('');
      return;
    }
    if (!password || password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('אימות הסיסמה אינו תואם.');
      setSuccess('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getGatewayApiBase()}/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: password,
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
          extractErrorMessage(response, data, 'לא ניתן היה לעדכן כרגע את הסיסמה.')
        );
      }

      setSuccess('הסיסמה עודכנה בהצלחה.');
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError?.message || 'לא ניתן היה לעדכן כרגע את הסיסמה.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="otp_screen reset_password_page">
      <img src={leavesright} className="leavesright" alt="" />
      <img src={schedulemeetingsman} className="schedulemeetingsman" alt="" />
      <div className="had_col">
        <Link to="/" className="brand_desktop"><img src={brandDesktop} alt="" /></Link>
      </div>
      <Link to="/login" className="next"><img src={nextI} alt="" /></Link>

      <div className="wrap">
        <Link to="/login" className="prev_page_link"><img src={previcon} alt="" />חזור</Link>
        <Link to="/" className="brand"><img src={brand} alt="" /></Link>

        <div className="col">
          <h1>איפוס סיסמה</h1>
          <p>הזן סיסמה חדשה כדי לעדכן את החשבון שלך.</p>

          <div className="form_input">
            <input
              type="password"
              placeholder="סיסמה חדשה"
              className="phone"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </div>

          <div className="form_input">
            <input
              type="password"
              placeholder="אימות סיסמה"
              className="phone"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  if (!isSubmitting) {
                    handleSubmit();
                  }
                }
              }}
            />
            {error && (
              <div className="form_error_com form_error">{error}</div>
            )}
            {success && (
              <div className="form_error_com form_success">{success}</div>
            )}
          </div>
        </div>

        {success ? (
          <button
            className="btn"
            type="button"
            onClick={() => navigate('/login')}
          >
            חזרה להתחברות
          </button>
        ) : (
          <button
            className="btn"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'מעדכן...' : 'עדכון סיסמה'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
