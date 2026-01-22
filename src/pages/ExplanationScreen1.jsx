// Homepage.jsx
import React from "react";
import { Link } from 'react-router-dom';

import brand from '../assets/images/logoup.svg';
import screenImage from '../assets/images/explanationscreen_image1.png';


const ExplanationScreen1 = () => {

  return (
    <div className="explanation_screen">
      <a href="/explanation-screen2" className="skip">דלג</a>
        <Link to="/" className="brand"> <img src={brand} alt="brand" /> </Link> 
        <div className="inner">
            <img src={screenImage} className="simage" alt="" />
            <div className="text">
                <ul className="dots d_flex d_flex_jc d_flex_ac">
                  <li className="active"></li>
                  <li></li>
                </ul>
                <h3>ייעוץ משכנתא מותאם אישית</h3>
                <p>מתכוונים לקנות בקרוב נכס? רגע לפני אולי  כדאי שפשוט תשוו, תבדקו, תעשו סימולציה ובעיקר, תנו לרובין להשיג בשבילכם יותר.</p>
                <div className="btn_col d_flex d_flex_ac d_flex_je">
                  <Link to="/explanation-screen2" className="next">הבא &gt; </Link>
                </div>
            </div>
        </div>
    </div>  
  );
};

export default ExplanationScreen1;