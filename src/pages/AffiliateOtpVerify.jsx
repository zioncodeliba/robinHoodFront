import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getGatewayApiBase } from "../utils/apiBase";

import nextI from '../assets/images/next_icon.svg';
import brand from '../assets/images/logoup_m.svg';
import otpverifiy from '../assets/images/otp_verify.svg';

const AffiliateOtpVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(30);
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState("phone");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const canResend = timer <= 0;

  const getOtpErrorMessage = (response, payload, fallback) => {
    const detail = payload?.detail || payload?.message || (typeof payload === 'string' ? payload : '');
    if (response?.status === 404 || detail === 'Affiliate not found') {
      return 'לא נמצא שותף עם הפרטים האלה.';
    }
    if (detail === 'Affiliate phone is missing') {
      return 'לשותף אין מספר טלפון במערכת.';
    }
    if (detail === 'OTP expired') {
      return 'הקוד פג תוקף. שלח שוב.';
    }
    if (detail === 'OTP invalid') {
      return 'קוד שגוי. נסה שוב.';
    }
    if (detail === 'OTP not found') {
      return 'קוד לא נמצא. שלח שוב.';
    }
    if (detail) return detail;
    return fallback;
  };

  useEffect(() => {
    const stateIdentifier = location.state?.identifier;
    const stateType = location.state?.type;
    const storedIdentifier = localStorage.getItem('affiliate_login_identifier') || '';
    const storedType = localStorage.getItem('affiliate_login_type') || '';
    setIdentifier(stateIdentifier || storedIdentifier || '');
    setIdentifierType(stateType || storedType || 'phone');
  }, [location.state]);

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (resendSuccess) {
      const timeout = setTimeout(() => {
        setResendSuccess("");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [resendSuccess]);

  const formatTime = (seconds) => {
    return `00.${seconds < 10 ? "0" + seconds : seconds}`;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    }
    if (phone.length === 9) {
      return `${phone.slice(0, 2)}-${phone.slice(2)}`;
    }
    return phone;
  };

  const handleChange = (e, index) => {
    const inputValue = e.target.value.replace(/\D/g, '');
    const value = inputValue.slice(-1);

    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      setError("");
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    if (value && index === 3) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 4 && !isSubmitting) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        setError("");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const buildPayload = (otpValue) => {
    if (identifierType === 'email') {
      return { email: identifier, otp: otpValue };
    }
    return { phone: identifier, otp: otpValue };
  };

  const handleResendOtp = async () => {
    if (!canResend || !identifier) {
      return;
    }

    setError("");
    setSuccess("");
    setResendSuccess("");
    setIsResending(true);

    try {
      const payload = identifierType === 'email'
        ? { email: identifier }
        : { phone: identifier };

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
        const errorMessage = getOtpErrorMessage(response, data, 'שגיאה בשליחת הקוד. נסה שוב.');
        throw new Error(errorMessage);
      }

      setResendSuccess(data?.message || 'קוד נשלח בהצלחה');

      if (data?.success || response.ok) {
        setTimer(30);
        setOtp(["", "", "", ""]);
        setError("");
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בשליחת הקוד. נסה שוב.');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join('');

    if (otpToVerify.length !== 4) {
      setError("נא להזין קוד בן 4 ספרות");
      return;
    }

    if (!identifier) {
      setError("אימייל/טלפון לא נמצא");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getGatewayApiBase()}/affiliate-verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(buildPayload(otpToVerify)),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = getOtpErrorMessage(response, data, 'קוד שגוי. נסה שוב.');
        throw new Error(errorMessage);
      }

      setSuccess(data?.message || 'אימות הצליח');

      if (data?.success || response.ok) {
        if (data.data?.token) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.setItem('affiliate_token', data.data.token);
          if (data.data.affiliate) {
            localStorage.setItem('affiliate_data', JSON.stringify(data.data.affiliate));
          }
        }

        localStorage.removeItem('affiliate_login_identifier');
        localStorage.removeItem('affiliate_login_type');

        setTimeout(() => {
          navigate('/brokerhomepage');
        }, 800);
      }
    } catch (err) {
      setError(err?.message || 'קוד שגוי. נסה שוב.');
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayIdentifier = identifierType === 'email'
    ? identifier
    : formatPhoneNumber(identifier);

  return (
    <div className="otp_screen otp_verify">
      <Link to="/affiliate-login" className="next"><img src={nextI} alt="" /></Link>

      <div className="wrap">
        <Link to="/" className="brand"><img src={brand} alt="" /></Link>

        <div className="col">
          <img src={otpverifiy} className="img" alt="" />
          <h1>קוד חד פעמי</h1>
          <p>נשלח לך קוד חד־פעמי (OTP) ל:</p>
          <p className="phone_text">{displayIdentifier || '---'}</p>

          <div className="form_input">
            <div className="otp_boxes">
              {[0, 1, 2, 3].map((_, i) => (
                <input
                  key={i}
                  type="tel"
                  inputMode="numeric"
                  maxLength="1"
                  className="in"
                  value={otp[i]}
                  ref={(el) => (inputsRef.current[i] = el)}
                  onInput={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  onFocus={handleFocus}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              ))}
            </div>
            {error && (
              <div className="form_error_com form_error">{error}</div>
            )}
            {resendSuccess && (
              <div className="form_error_com form_success">{resendSuccess}</div>
            )}
            {success && (
              <div className="form_error_com form_success">{success}</div>
            )}

            <div className="timer">{formatTime(timer)}</div>

            <div className="send_again">
              לא קיבלתי קוד,{" "}
              {canResend ? (
                <span
                  onClick={handleResendOtp}
                  disabled={isResending}
                  style={{ cursor: isResending ? "not-allowed" : "pointer" }}
                  className="resend_link"
                >
                  {isResending ? 'שולח...' : 'שלח שוב'}
                </span>
              ) : (
                <span
                  aria-disabled="true"
                  style={{ opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }}
                >
                  שלח שוב
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateOtpVerify;
