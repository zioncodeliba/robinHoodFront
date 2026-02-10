import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { getGatewayApiBase } from "../utils/apiBase";

import brand from '../assets/images/logoup_m.svg';
import nextI from '../assets/images/next_icon.svg';
import phoneotp from '../assets/images/phone_otp_i.svg';

const OtpScreen = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const getOtpErrorMessage = (response, payload, fallback) => {
    const detail = payload?.detail || payload?.message || (typeof payload === 'string' ? payload : '');
    if (response?.status === 404 || detail === 'Customer not found' || detail === 'Affiliate not found' || detail === 'User not found') {
      return 'לא נמצא משתמש עם המספר הזה.';
    }
    if (detail) return detail;
    return fallback;
  };
  const handleSubmit = async () => {
    //  min 9 and max 10 digits and only numbers
    if (phone.trim().length < 9 || phone.trim().length > 10 || !/^\d+$/.test(phone.trim())) {
      setError("נא להקליד מספר טלפון תקין (9-10 ספרות)");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getGatewayApiBase()}/unified-generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
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

      console.log(data);

      setSuccess(data?.message || 'קוד נשלח בהצלחה');

      // Store phone number in localStorage on success
      if (data?.success || response.ok) {
        localStorage.setItem('otp_phone', phone.trim());

        // Navigate to OTP verification page after successful send
        setTimeout(() => {
          navigate('/otp-verify', { state: { phone: phone.trim() } });
        }, 1000);

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
           <h1>מספר טלפון</h1>
          <p>אנא הזן את מספר הטלפון לצורך הזדהות ושליחת קוד</p>

          <div className="form_input">           
            <input
              type="text"
              placeholder="הקלד.."
              className="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

export default OtpScreen;
