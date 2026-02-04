// Homepage.jsx
import React from "react";
import { Link } from 'react-router-dom';

import brand from '../assets/images/logoup.svg';
import screenImage2 from '../assets/images/explanationscreen_image2.png';

import '../components/brokercomponents/BrokerHomepage.css';

const ExplanationScreen2 = () => {

  return (
    <div className="explanation_screen explanation_screen2">
      <Link to="/login" className="skip">דלג</Link>
      <Link to="/login" className="brand"> 
          <img src={brand} alt="brand" />
        </Link>
        <div className="inner">
            <img src={screenImage2} className="simage" alt="" />
            <div className="text">
                <ul className="dots d_flex d_flex_jc d_flex_ac">
                  <li className="active"></li>
                  <li className="active"></li>
                </ul>
                <h3>ייעוץ משכנתא מותאם אישית</h3>
                <p>מתכוונים לקנות בקרוב נכס? רגע לפני אולי  כדאי שפשוט תשוו, תבדקו, תעשו סימולציה ובעיקר, תנו לרובין להשיג בשבילכם יותר.</p>
                <div className="btn_col d_flex d_flex_ac d_flex_jb">
                  <Link to="/explanation-screen" className="prev">&lt; הקודם </Link>
                  <Link to="/login" className="next">הבא &gt; </Link>
                </div>
            </div>
        </div>
    </div>  
  );
};

export default ExplanationScreen2;
