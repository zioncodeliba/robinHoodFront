import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useGoogleAuth from '../utils/useGoogleAuth';
import { getGatewayApiBase } from '../utils/apiBase';

import logoup from '../assets/images/logoup.svg';
import appleIcon from '../assets/images/apple_i.svg';
import googleIcon from '../assets/images/google_i.svg';
// import otpIcon from '../assets/images/otp.png';
import otpIcon from '../assets/images/otp.svg';
import loginman from '../assets/images/login_img.png';


const Loginpage = () => {
  const navigate = useNavigate();
  const { isLoaded, handleGoogleLogin } = useGoogleAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleGoogleAuth = async (credential) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${getGatewayApiBase()}/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          credential: credential,
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
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'שגיאה בהתחברות עם גוגל. נסה שוב.';
        throw new Error(errorMessage);
      }

      // Store auth token and user data on success
      if (data?.success || response.ok) {
        if (data.data?.token) {
          localStorage.setItem('auth_token', data.data.token);
          if (data.data.customer) {
            localStorage.setItem('user_data', JSON.stringify(data.data.customer));
          }
        }

        // Navigate to home page
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בהתחברות עם גוגל. נסה שוב.');
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
      (error) => setError(error || 'שגיאה בהתחברות עם גוגל')
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

    // Backend should start Apple OAuth and then redirect back with token in query (?token=...)
    const returnTo = window.location.origin + '/';
    window.location.href = `${getGatewayApiBase()}/apple-login?redirect_uri=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="login_page registration_page comman_loginpopup">
      <Link to="/" className="reglogo"> <img src={logoup} alt="" /> </Link>
      <img src={loginman} className='loginman' alt="" />

      <Link to="/login-with-otp" className='link otp'><img src={otpIcon} alt="" /> כניסה קוד חד פעמי</Link>

      {error && (
        <div className="form_error">{error}</div>
      )}

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

      {/* <div className='forgot_box'>
        <Link to="/forgotpassword" className="forgot_password">שכחת סיסמא?</Link>
      </div> */}

      <div className="btn_box">
        <Link to="/registration" className='login_btn btn'>הרשמה</Link>
      </div>

    </div>
  );
};

export default Loginpage;
