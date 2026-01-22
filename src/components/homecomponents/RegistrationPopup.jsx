import React ,{useState} from 'react';
import { Link} from 'react-router-dom';

import appleIcon from '../../assets/images/apple_i.svg';
import googleIcon from '../../assets/images/google_i.svg';
import userIcon from '../../assets/images/user.png';
import emailIcon from '../../assets/images/email.png';
import phoneIcon from '../../assets/images/phone.png';

const RegistrationPopup = ({showRegistrationPopup}) => {
  const [isChecked, setIsChecked] = useState(true);
  
  return (
    <div className={`registration_popup comman_loginpopup ${(showRegistrationPopup ? 'open': '')}`}>
      <button className='link register_apple'><img src={appleIcon} alt="" /> הרשמה באמצעות אפל</button>
      <button className='link register_google'><img src={googleIcon} alt="" /> הרשמה באמצעות גוגל</button>
      <div className="or">
        <span>או</span>
      </div>
      <form>
        <div className="col_form">
          <span><img src={userIcon} alt="" /></span>
          <input type="text" placeholder='שם פרטי' className='in' />
        </div>
        <div className="col_form">
          <span><img src={emailIcon} alt="" /></span>
          <input type="text" placeholder='דוא”ל' className='in' />
        </div>
        <div className="col_form">
          <span><img src={phoneIcon} alt="" /></span>
          <input type="text" placeholder='טלפון' className='in' />
        </div>
        <label htmlFor="agree" className='agree_check'>
          <input type="checkbox" id='agree' 
           checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <span>אני מאשר את <Link to=""> התקנון ותנאי השירות</Link></span>
        </label>
        <input type="submit" value="הרשמה" className='btn submit' />
      </form>
    </div>
  );
};

export default RegistrationPopup;