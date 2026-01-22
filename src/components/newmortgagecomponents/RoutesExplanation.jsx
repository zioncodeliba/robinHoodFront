
import React from "react";
import './RoutesExplanation.css';
import notificationicon from '../../assets/images/notification_i.svg';

const RoutesExplanation = () => {

  return (
    <div className="routes_explanation">
        <h2>התמהיל שלך</h2>
        <div className="note d_flex d_flex_ac d_flex_jc">
          <img src={notificationicon} alt="" />
          <span>הסבר על המסלולים</span>
        </div>
        <ul className="title_routes d_flex d_flex_ac">
          <li>מסלולים</li>
          <li>מס׳ חודשים</li>
          <li>ריבית</li>
          <li>יתרה</li>
        </ul>
        <div className="list_routes">
          <ul>
            <li><span><em>(40%)</em> ק"צ</span></li>
            <li>108</li>
            <li>5%</li>
            <li>640,000 ₪</li>
          </ul>
          <ul>
            <li><span><em>(40%)</em> מ"צ</span></li>
            <li>108</li>
            <li>5%</li>
            <li>368,000 ₪</li>
          </ul>
          <ul>
            <li><span><em>(40%)</em> פריים</span></li>
            <li>108</li>
            <li>5%</li>
            <li>592,000 ₪</li>
          </ul>
          <div className="total">סה"כ: 1,700,000 ש"ח</div>
        </div>
    </div>
  );
};

export default RoutesExplanation;
