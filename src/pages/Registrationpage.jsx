import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useGoogleAuth from '../utils/useGoogleAuth';
import { getGatewayApiBase } from '../utils/apiBase';
import { clearAffiliateCode, getAffiliateCode } from '../utils/affiliate';

import logoup from '../assets/images/logoup.svg';
import appleIcon from '../assets/images/apple_i.svg';
import googleIcon from '../assets/images/google_i.svg';

import closeimg from '../assets/images/close_popup.png';

// import userIcon from '../assets/images/user.png';
// import emailIcon from '../assets/images/email.png';
// import phoneIcon from '../assets/images/phone.png';

import userIcon from '../assets/images/user.svg';
import emailIcon from '../assets/images/email.svg';
import phoneIcon from '../assets/images/phone.png';

const Registrationpage = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const res = await fetch(`${getGatewayApiBase()}/register`, {
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

      // Try to parse JSON, but don’t crash if empty/non-JSON.
      let data = null;
      try {
        data = await res.json();
        if (data?.success) {
          setTimeout(() => {
            navigate('/login-with-otp');
          }, 1000);
        }
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'Registration failed.';
        throw new Error(msg);
      }

      setSuccess(data?.message || 'נרשמת בהצלחה.');
      setFirstName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
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
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          credential: credential,
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
        const errorMessage =
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'שגיאה בהרשמה עם גוגל. נסה שוב.';
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
        localStorage.removeItem('affiliate_token');
        localStorage.removeItem('affiliate_data');
        clearAffiliateCode();

        setSuccess(data?.message || 'נרשמת בהצלחה עם גוגל');

        // Navigate to home page
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בהרשמה עם גוגל. נסה שוב.');
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
      (error) => setError(error || 'שגיאה בהרשמה עם גוגל')
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

    // Backend should start Apple OAuth and then redirect back with token in query (?token=...)
    const returnTo = window.location.origin + '/';
    const affiliateCode = getAffiliateCode();
    const affiliateParam = affiliateCode ? `&affiliate_code=${encodeURIComponent(affiliateCode)}` : '';
    window.location.href = `${getGatewayApiBase()}/apple-login?redirect_uri=${encodeURIComponent(returnTo)}${affiliateParam}`;
  };

   const [openPopupId, setOpenPopupId] = useState(null);
  
    const openPopup = (id) => {
      setOpenPopupId(id);
    };
  
    const closePopup = () => {
      setOpenPopupId(null);
    };

  return (
    <>
    <div className="registration_page comman_loginpopup">
      <Link to="/" className="reglogo"> <img src={logoup} alt="" /> </Link>
      <h1>הרשמה</h1>
      <button
        className='link register_apple'
        onClick={onAppleClick}
        disabled={isAppleLoading}
      >
        <img src={appleIcon} alt="" />
        {isAppleLoading ? 'מתחבר...' : 'הרשמה באמצעות אפל'}
      </button>
      <button
        className='link register_google'
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
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="col_form">
          <span><img src={emailIcon} alt="" /></span>
          <input
            type="email"
            placeholder='דוא”ל'
            className="in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
        {error ? <div className="form_error_com col_form form_error ">{error}</div> : null}
        <label htmlFor="agree" className='agree_check'>
          <input type="checkbox" id='agree'
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <span>אני מאשר את <Link to=""
           onClick={(e) => {
            e.preventDefault();
            openPopup("terms");
          }}
          > התקנון ותנאי השירות </Link></span>
        </label>       
         {errorcheck ? <div className="form_error_com col_form form_error">{errorcheck}</div> : null}
    
        <div className="btn_box">
          <div className="btn_col d_flex d_flex_jb d_flex_ac">
            <Link to="/login" className='Login_records btn'>כניסה לרשומים</Link>
            <input
              type="submit"
              value={isSubmitting ? 'שולח...' : 'הרשמה'}
              className="btn submit"
              disabled={isSubmitting}
            />
          </div>
        </div>
            {success ? <div className="form_error_com col_form form_success">{success}</div> : null}
      </form>

    </div>
    {/* popup terms conditions */}
    <div className={`terms_conditions_note  ${openPopupId === "terms" ? "open" : ""}`}> 
      <span className="close"  onClick={closePopup}><img src={closeimg} alt="" /></span>
      <div className="inner">
          <h2>terms conditions note</h2>
          <div className="col">
            <h3>What is Lorem Ipsum?</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
          </div>

      </div>
    </div>
    </>
  );
};

export default Registrationpage;
