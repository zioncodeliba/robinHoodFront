import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useGoogleAuth from '../../utils/useGoogleAuth';
import { getGatewayApiBase } from '../../utils/apiBase';
import { clearAffiliateCode, getAffiliateCode } from '../../utils/affiliate';

import appleIcon from '../../assets/images/apple_i.svg';
import googleIcon from '../../assets/images/google_i.svg';
import userIcon from '../../assets/images/user.svg';
import emailIcon from '../../assets/images/email.svg';
import phoneIcon from '../../assets/images/phone.png';

const RegistrationPopup = ({ showRegistrationPopup }) => {
  const navigate = useNavigate();
  const { isLoaded, handleGoogleLogin } = useGoogleAuth();

  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorcheck, setErrorcheck] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const extractErrorMessage = (payload, fallback) => {
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (!trimmed) return fallback;
      try {
        return extractErrorMessage(JSON.parse(trimmed), trimmed);
      } catch {
        return trimmed;
      }
    }

    if (payload && typeof payload === 'object') {
      const candidate = payload.detail ?? payload.message ?? payload.error;
      if (candidate !== undefined) {
        return extractErrorMessage(candidate, fallback);
      }
    }

    return fallback;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setErrorcheck('');
    setSuccess('');

    if (!isChecked) {
      setErrorcheck('אנא אשר את התקנון ותנאי השירות.');
      return;
    }

    if (!firstName.trim() || !email.trim() || !phone.trim()) {
      setError('נא למלא שם פרטי, דוא״ל וטלפון.');
      return;
    }

    setIsSubmitting(true);
    try {
      const affiliateCode = getAffiliateCode();
      const response = await fetch(`${getGatewayApiBase()}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          email: email.trim(),
          phone: phone.trim(),
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
        const message = extractErrorMessage(data, 'Registration failed.');
        throw new Error(message);
      }

      setSuccess(data?.message || 'נרשמת בהצלחה.');
      setFirstName('');
      setEmail('');
      setPhone('');
      setTimeout(() => {
        navigate('/login-with-otp');
      }, 900);
    } catch (requestError) {
      setError(requestError?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async (credential) => {
    setIsGoogleLoading(true);
    setError('');
    setErrorcheck('');
    setSuccess('');

    try {
      const affiliateCode = getAffiliateCode();
      const response = await fetch(`${getGatewayApiBase()}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          credential,
          ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
          intent: 'register',
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage = extractErrorMessage(
          data,
          'שגיאה בהרשמה עם גוגל. נסה שוב.'
        );
        throw new Error(errorMessage);
      }

      if (data?.success || response.ok) {
        if (data?.data?.token) {
          localStorage.setItem('auth_token', data.data.token);
          if (data.data.customer) {
            localStorage.setItem('user_data', JSON.stringify(data.data.customer));
          }
        }
        localStorage.removeItem('affiliate_token');
        localStorage.removeItem('affiliate_data');
        clearAffiliateCode();
        setSuccess(data?.message || 'נרשמת בהצלחה עם גוגל');
        setTimeout(() => {
          navigate('/');
        }, 900);
      }
    } catch (requestError) {
      setError(requestError?.message || 'שגיאה בהרשמה עם גוגל. נסה שוב.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onGoogleClick = () => {
    if (!isLoaded) {
      setError('טוען שירותי גוגל...');
      return;
    }

    handleGoogleLogin(
      (credential) => handleGoogleAuth(credential),
      (errorMessage) => setError(errorMessage || 'שגיאה בהרשמה עם גוגל')
    );
  };

  const onAppleClick = () => {
    const apiBaseEnv = process.env.REACT_APP_API_BASE_URL;
    if (!apiBaseEnv) {
      setError('חסר REACT_APP_API_BASE_URL להגדרת הרשמה עם אפל.');
      return;
    }

    setIsAppleLoading(true);
    setError('');
    setSuccess('');

    const returnTo = window.location.origin + '/';
    const affiliateCode = getAffiliateCode();
    const affiliateParam = affiliateCode ? `&affiliate_code=${encodeURIComponent(affiliateCode)}` : '';
    window.location.href = `${getGatewayApiBase()}/apple-login?redirect_uri=${encodeURIComponent(returnTo)}${affiliateParam}`;
  };

  return (
    <div className={`registration_popup comman_loginpopup ${(showRegistrationPopup ? 'open' : '')}`}>
      <button
        type="button"
        className="link register_apple"
        onClick={onAppleClick}
        disabled={isAppleLoading}
      >
        <img src={appleIcon} alt="" />
        {isAppleLoading ? 'מתחבר...' : 'הרשמה באמצעות אפל'}
      </button>
      <button
        type="button"
        className="link register_google"
        onClick={onGoogleClick}
        disabled={isGoogleLoading || !isLoaded}
      >
        <img src={googleIcon} alt="" />
        {isGoogleLoading ? 'מתחבר...' : 'הרשמה באמצעות גוגל'}
      </button>
      <div className="or">
        <span>או</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="col_form">
          <span><img src={userIcon} alt="" /></span>
          <input
            type="text"
            placeholder="שם פרטי"
            className="in"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="col_form">
          <span><img src={emailIcon} alt="" /></span>
          <input
            type="email"
            placeholder="דוא”ל"
            className="in"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="col_form">
          <span><img src={phoneIcon} alt="" /></span>
          <input
            type="tel"
            placeholder="טלפון"
            className="in"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
          />
        </div>
        {error ? <div className="form_error_com col_form form_error">{error}</div> : null}
        <label htmlFor="agree-popup" className="agree_check">
          <input
            type="checkbox"
            id="agree-popup"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <span>
            אני מאשר את
            <Link to="/registration"> התקנון ותנאי השירות</Link>
          </span>
        </label>
        {errorcheck ? <div className="form_error_com col_form form_error">{errorcheck}</div> : null}
        <input
          type="submit"
          value={isSubmitting ? 'שולח...' : 'הרשמה'}
          className="btn submit"
          disabled={isSubmitting}
        />
        {success ? <div className="form_error_com col_form form_success">{success}</div> : null}
      </form>
    </div>
  );
};

export default RegistrationPopup;
