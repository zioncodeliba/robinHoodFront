import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getGatewayApiBase } from "../utils/apiBase";

import brand from '../assets/images/logoup_m.svg';
import nextI from '../assets/images/next_icon.svg';
import phoneotp from '../assets/images/phone_otp_i.svg';

const AffiliateLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const getAffiliateOtpErrorMessage = (response, payload, fallback) => {
    const detail = payload?.detail || payload?.message || (typeof payload === 'string' ? payload : '');
    if (response?.status === 404 || detail === 'Affiliate not found') {
      return 'לא נמצא שותף עם הפרטים האלה.';
    }
    if (detail === 'Affiliate phone is missing') {
      return 'לשותף אין מספר טלפון במערכת.';
    }
    if (detail === 'Phone or email is required') {
      return 'נא להזין אימייל או טלפון תקין.';
    }
    if (detail) return detail;
    return fallback;
  };

  const parseIdentifier = (value) => {
    const trimmed = value.trim();
    const isEmail = trimmed.includes('@');
    if (isEmail) {
      return { type: 'email', value: trimmed.toLowerCase() };
    }
    const digits = trimmed.replace(/\D/g, '');
    return { type: 'phone', value: digits };
  };

  const handleSubmit = async () => {
    const parsed = parseIdentifier(identifier);
    if (!parsed.value) {
      setError("נא להזין אימייל או מספר טלפון");
      return;
    }

    if (parsed.type === 'phone') {
      if (parsed.value.length < 9 || parsed.value.length > 10) {
        setError("נא להקליד מספר טלפון תקין (9-10 ספרות)");
        return;
      }
    } else {
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(parsed.value);
      if (!emailOk) {
        setError("נא להזין אימייל תקין");
        return;
      }
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const payload = parsed.type === 'email'
        ? { email: parsed.value }
        : { phone: parsed.value };

      const response = await fetch(`${getGatewayApiBase()}/affiliate-generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = getAffiliateOtpErrorMessage(
          response,
          data,
          'שגיאה בשליחת הקוד. נסה שוב.'
        );
        throw new Error(errorMessage);
      }

      setSuccess(data?.message || 'קוד נשלח בהצלחה');

      if (data?.success || response.ok) {
        localStorage.setItem('affiliate_login_identifier', parsed.value);
        localStorage.setItem('affiliate_login_type', parsed.type);
        setTimeout(() => {
          navigate('/affiliate-otp-verify', { state: { identifier: parsed.value, type: parsed.type } });
        }, 800);
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בשליחת הקוד. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="otp_screen">
      <Link to="/login" className="next"><img src={nextI} alt="" /></Link>

      <div className="wrap">
        <Link to="/" className="brand"><img src={brand} alt="" /></Link>

        <div className="col">
          <img src={phoneotp} className="img" alt="" />
          <h1>כניסת שותפים</h1>
          <p>הזן אימייל או מספר טלפון כדי לקבל קוד חד־פעמי</p>

          <div className="form_input">
            <input
              type="text"
              placeholder="אימייל או טלפון"
              className="phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
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

          <button
            className="btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'שולח...' : 'שליחה'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLogin;
