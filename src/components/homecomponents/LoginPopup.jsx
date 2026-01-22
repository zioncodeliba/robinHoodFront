import React  from 'react';
import { Link} from 'react-router-dom';

import appleIcon from '../../assets/images/apple_i.svg';
import googleIcon from '../../assets/images/google_i.svg';
import otpIcon from '../../assets/images/otp.png';


const LoginPopup = ({showloginPopup}) => {
  
  return (
    <div className={`login_popup comman_loginpopup ${(showloginPopup ? 'open':'')}`}>
      <button className='link otp'><img src={otpIcon} alt="" /> כניסה קוד חד פעמי</button>
      <button className='link register_google'><img src={googleIcon} alt="" /> הרשמה באמצעות גוגל</button>
      <button className='link register_apple'><img src={appleIcon} alt="" /> הרשמה באמצעות אפל</button>   
      <div>
        <Link to="/forgotpassword" className="forgot_password">שכחת סיסמא?</Link>   
      </div>
      <a href="/" className='btn btn_login'>כניסה</a>
    </div>
  );
};

export default LoginPopup;