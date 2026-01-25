// Homepage.jsx
import React from "react";
import { Link } from 'react-router-dom';

import '../components/homecomponents/homepage.css';

import mortgageimg1 from '../assets/images/op1.png';
import mortgageimg2 from '../assets/images/op2.png';
import loginleftimg from '../assets/images/login_left_img.png';
import loginleftimgmobile from '../assets/images/login_left_img_m.png';



const Homepage = () => {

  return (
    <div className="homepage d_flex">
      <div className="right_col">
        <h1>ברוכים הבאים <span>לרובין</span>.</h1>
        <p>המקום שיוציא עבורכם את המשכנתא וההלוואה
          המשתלמת ביותר עם שירותי השוואה, ניתוח, ליווי
          אישי, ניטור משכנתא מתקדם וצ’אט חדשני שפשוט
          יעבדו בשבילכם</p>
        <label>בחלק התחתון ניתן לבחור באחת משתי האפשרויות...
          <br /> אז שנתחיל?</label>
        <h3>מה נרצה לעשות היום?</h3>
        <ul className="d_flex">
          <li>
            <Link to="/aichat">
              <img src={mortgageimg1} alt="" />
              <span>לקיחת <br /> משכנתא חדשה</span>
            </Link>
          </li>
          <li>
            <Link to="/recycle-loan">
              <img src={mortgageimg2} alt="" />
              <span>בדיקת מחזור <br />משכנתא</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="left_col">
        <img src={loginleftimg} className="desktop_img" alt="" />
        <img src={loginleftimgmobile} className="mobile_img" alt="" />
      </div>
    </div>
  );
};

export default Homepage;
