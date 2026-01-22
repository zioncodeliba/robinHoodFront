// OtpVerify.jsx
import React from "react";
import { Link } from 'react-router-dom';


import nextI from '../assets/images/next_icon.png';
import brand from '../assets/images/logoup_m.svg';
import otpverifiy from '../assets/images/otp_verify.svg';



const OtpVerify = () => {
  return (
    <div className="otp_screen otp_verify">
      <Link to="/" className="next"><img src={nextI} alt="" /></Link>
      <div className="wrap">
        <Link to="/" className="brand"><img src={brand} alt="" /></Link>
          <div className="col">
            <img src={otpverifiy} className="img" alt="" />
            <h1>קוד חד פעמי</h1>
            <p>נשלח לך סיסמה חד־פעמית (OTP) למספר הנייד הזה:</p>
            <p className="phone_text">056-6252356</p>
            <div className="form_input">
              <div className="otp_boxes">
                <input maxLength="1" className="in" />
                <input maxLength="1" className="in" />
                <input maxLength="1" className="in" />
                <input maxLength="1" className="in" />
              </div>
              
              <div className="timer"> 00.30 </div>
              <div className="send_again">
                לא קיבלתי קוד,<Link to='/'>שלח שוב</Link>
              </div>

            </div>
            <button className="btn">כניסה</button>
          </div>     
      </div>
     
    </div>
  );
};

export default OtpVerify;
