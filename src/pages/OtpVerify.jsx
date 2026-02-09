import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getGatewayApiBase } from "../utils/apiBase";
import { clearAffiliateCode, getAffiliateCode } from "../utils/affiliate";

import nextI from '../assets/images/next_icon.svg';
import brand from '../assets/images/logoup_m.svg';
import otpverifiy from '../assets/images/otp_verify.svg';

// const OtpVerify = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const inputsRef = useRef([]);
//   const [timer, setTimer] = useState(30);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otp, setOtp] = useState(["", "", "", ""]);

const OtpVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(30);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const canResend = timer <= 0;

  const getOtpErrorMessage = (response, payload, fallback) => {
    const detail = payload?.detail || payload?.message || (typeof payload === 'string' ? payload : '');
    if (response?.status === 404 || detail === 'Customer not found' || detail === 'Affiliate not found' || detail === 'User not found') {
      return 'לא נמצא משתמש עם המספר הזה. יש לבצע הרשמה לפני התחברות עם OTP.';
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
    if (detail === 'Phone is required') {
      return 'נא להזין מספר טלפון תקין.';
    }
    if (detail) return detail;
    return fallback;
  };

  // Get phone number from location state or localStorage
  useEffect(() => {
    const phone = location.state?.phone || localStorage.getItem('otp_phone') || '';
    setPhoneNumber(phone);
  }, [location.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Format phone number for display (e.g., 050-1234567)
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // If phone is 10 digits, format as XXX-XXXXXXX
    if (phone.length === 10) {
      return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    }
    // If phone is 9 digits, format as XX-XXXXXXX
    if (phone.length === 9) {
      return `${phone.slice(0, 2)}-${phone.slice(2)}`;
    }
    return phone;
  };

  // TIMER LOGIC — 30 sec countdown
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Auto-hide resend success message after 3 seconds
  useEffect(() => {
    if (resendSuccess) {
      const timeout = setTimeout(() => {
        setResendSuccess("");
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [resendSuccess]);

  //FORMAT TIMER (00.30)
  const formatTime = (seconds) => {
    return `00.${seconds < 10 ? "0" + seconds : seconds}`;
  };


  // Move cursor behavior and update OTP state
  const handleChange = (e, index) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits

    // Get the last entered digit (handles paste or multiple digits)
    const value = inputValue.slice(-1); // Take only the last character

    if (!value) {
      // If empty, clear this input
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      setError("");
      return;
    }

    // Overwrite the current input with the new value
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input after entering a digit
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when the last digit is entered
    if (value && index === 3) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 4 && !isSubmitting) {
        handleVerifyOtp(fullOtp);
      }
    }

  };

  const handleKeyDown = (e, index) => {
    // Handle backspace - clear current and move to previous
    if (e.key === "Backspace") {
      if (!e.target.value && index > 0) {
        // If current input is empty, move to previous and clear it
        inputsRef.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      } else if (e.target.value) {
        // If current input has value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Handle click - select all text when clicking on an input
  const handleFocus = (e) => {
    e.target.select();
  };

  // Resend OTP API call
  const handleResendOtp = async () => {
    if (!canResend || !phoneNumber) {
      return;
    }

    setError("");
    setSuccess("");
    setResendSuccess("");
    setIsResending(true);

    try {
      const response = await fetch(`${getGatewayApiBase()}/unified-generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage =
          getOtpErrorMessage(response, data, 'שגיאה בשליחת הקוד. נסה שוב.');
        throw new Error(errorMessage);
      }

      setResendSuccess(data?.message || 'קוד נשלח בהצלחה');

      // Reset timer and clear OTP inputs on success
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

  // Verify OTP API call
  const handleVerifyOtp = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join('');

    if (otpToVerify.length !== 4) {
      setError("נא להזין קוד בן 4 ספרות");
      return;
    }

    if (!phoneNumber) {
      setError("מספר טלפון לא נמצא");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const affiliateCode = getAffiliateCode();
      const response = await fetch(`${getGatewayApiBase()}/unified-verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpToVerify,
          ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage =
          getOtpErrorMessage(response, data, 'קוד שגוי. נסה שוב.');
        throw new Error(errorMessage);
      }

      setSuccess(data?.message || 'אימות הצליח');

      // Navigate on successful verification
      if (data?.success || response.ok) {
        const role = data?.data?.role;
        const token = data?.data?.token;
        if (role === 'affiliate' || data?.data?.affiliate) {
          if (token) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.setItem('affiliate_token', token);
            if (data.data?.affiliate) {
              localStorage.setItem('affiliate_data', JSON.stringify(data.data.affiliate));
            }
          }
          clearAffiliateCode();
          localStorage.removeItem('otp_phone');
          setTimeout(() => {
            navigate('/brokerhomepage');
          }, 1000);
          return;
        }

        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_data', JSON.stringify(data.data?.customer));
        }
        localStorage.removeItem('affiliate_token');
        localStorage.removeItem('affiliate_data');
        clearAffiliateCode();

        localStorage.removeItem('otp_phone');

        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setError(err?.message || 'קוד שגוי. נסה שוב.');
      // Clear OTP inputs on error
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="otp_screen otp_verify">
      <Link to="/login-with-otp" className="next"><img src={nextI} alt="" /></Link>

      <div className="wrap">
        <Link to="/" className="brand"><img src={brand} alt="" /></Link>

        <div className="col">
          <img src={otpverifiy} className="img" alt="" />
          <h1>קוד חד פעמי</h1>
         
          {/* <p>נשלח לך סיסמה חד־פעמית (0O0OTPPPP) למספר הנייד הזה:</p> */}
          <p>נשלח לך סיסמה חד־פעמית (OTP) למספר הנייד הזה:</p>
          <p className="phone_text">{phoneNumber ? formatPhoneNumber(phoneNumber) : '---'}</p>

          <div className="form_input">

            

            {/* OTP BOXES */}
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

            {/* TIMER */}
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

          <button
            className="btn"
            onClick={() => handleVerifyOtp()}
            disabled={isSubmitting || otp.join('').length !== 4}
          >
            {isSubmitting ? 'מאמת...' : 'כניסה'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;
