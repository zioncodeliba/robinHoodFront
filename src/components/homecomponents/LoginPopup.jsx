import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useGoogleAuth from '../../utils/useGoogleAuth';
import { getGatewayApiBase } from '../../utils/apiBase';
import { clearAffiliateCode, getAffiliateCode } from '../../utils/affiliate';

import appleIcon from '../../assets/images/apple_i.svg';
import googleIcon from '../../assets/images/google_i.svg';
import otpIcon from '../../assets/images/otp.png';


const LoginPopup = ({showloginPopup}) => {
  const navigate = useNavigate();
  const { isLoaded, handleGoogleLogin } = useGoogleAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const extractErrorMessage = (payload, fallback) => {
    if (typeof payload === 'string' && payload.trim()) {
      try {
        const parsed = JSON.parse(payload);
        if (parsed?.detail) return parsed.detail;
      } catch {
        // ignore parse
      }
      return payload;
    }
    if (payload && typeof payload === 'object') {
      const detail = payload.detail || payload.message;
      if (typeof detail === 'string' && detail.trim()) {
        try {
          const parsed = JSON.parse(detail);
          if (parsed?.detail) return parsed.detail;
        } catch {
          // ignore parse
        }
        return detail;
      }
    }
    return fallback;
  };

  const handleGoogleAuth = async (credential) => {
    setIsLoading(true);
    setError('');

    try {
      const affiliateCode = getAffiliateCode();
      const response = await fetch(`${getGatewayApiBase()}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          credential: credential,
          ...(affiliateCode ? { affiliate_code: affiliateCode } : {}),
          intent: 'login',
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
          'שגיאה בהתחברות עם גוגל. נסה שוב.'
        );
        throw new Error(errorMessage);
      }

      if (data?.success || response.ok) {
        if (data.data?.affiliate) {
          if (data.data?.token) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.setItem('affiliate_token', data.data.token);
            localStorage.setItem('affiliate_data', JSON.stringify(data.data.affiliate));
          }
          clearAffiliateCode();
          navigate('/brokerhomepage');
          return;
        }

        if (data.data?.token) {
          localStorage.setItem('auth_token', data.data.token);
          if (data.data.customer) {
            localStorage.setItem('user_data', JSON.stringify(data.data.customer));
          }
        }
        localStorage.removeItem('affiliate_token');
        localStorage.removeItem('affiliate_data');
        clearAffiliateCode();
        navigate('/');
      }
    } catch (err) {
      const message = err?.message || 'שגיאה בהתחברות עם גוגל. נסה שוב.';
      if (window.google?.accounts?.id?.cancel) {
        window.google.accounts.id.cancel();
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleClick = () => {
    if (!isLoaded) {
      setError('טוען שירותי גוגל...');
      return;
    }

    handleGoogleLogin(
      (credential) => handleGoogleAuth(credential),
      (errorMessage) => setError(errorMessage || 'שגיאה בהתחברות עם גוגל')
    );
  };

  const onAppleClick = () => {
    const apiBaseEnv = process.env.REACT_APP_API_BASE_URL;
    if (!apiBaseEnv) {
      setError('חסר REACT_APP_API_BASE_URL להגדרת התחברות עם אפל.');
      return;
    }

    setIsAppleLoading(true);
    setError('');

    const returnTo = window.location.origin + '/';
    const affiliateCode = getAffiliateCode();
    const affiliateParam = affiliateCode ? `&affiliate_code=${encodeURIComponent(affiliateCode)}` : '';
    window.location.href = `${getGatewayApiBase()}/apple-login?redirect_uri=${encodeURIComponent(returnTo)}${affiliateParam}`;
  };

  return (
    <div className={`login_popup comman_loginpopup ${(showloginPopup ? 'open':'')}`}>
      <button className='link otp' onClick={() => navigate('/login-with-otp')}>
        <img src={otpIcon} alt="" /> כניסה קוד חד פעמי
      </button>
      <button
        className='link register_google'
        onClick={onGoogleClick}
        disabled={isLoading || !isLoaded}
      >
        <img src={googleIcon} alt="" />
        {isLoading ? 'מתחבר...' : 'כניסה באמצעות גוגל'}
      </button>
      <button
        className='link register_apple'
        onClick={onAppleClick}
        disabled={isAppleLoading}
      >
        <img src={appleIcon} alt="" />
        {isAppleLoading ? 'מתחבר...' : 'כניסה באמצעות אפל'}
      </button>
      {error && (
        <div className="form_error">{error}</div>
      )}
      <div>
        <Link to="/forgotpassword" className="forgot_password">שכחת סיסמא?</Link>   
      </div>
      <a href="/" className='btn btn_login'>כניסה</a>
    </div>
  );
};

export default LoginPopup;
