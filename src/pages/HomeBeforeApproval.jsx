// Homepage.jsx
import React from "react";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import nextprevarrow from "../assets/images/np_arrow.svg";
import hapoalimbankicon from "../assets/images/bank_hapoalim.png";
import timeicon from "../assets/images/tt.png";
import offericon from "../assets/images/offer_i.png";
import previcon from '../assets/images/prev_icon.png';

// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';


const HomeBeforeApproval = () => {

    const questionsdata = [
        {
            question: "כמה זמן לוקח האישור העקרוני?",
            answer: "האישור העקרוני לוקח בדרך כלל בין 3-5 ימי עסקים, תלוי בבנק ובמורכבות הבקשה."
        },
        {
            question: "מה קורה אם האישור נדחה?",
            answer: "במקרה של דחייה, נעזור לך להבין את הסיבות ולהגיש בקשה מתוקנת או לבנק אחר."
        },
        {
            question: "האם אני יכול לבטל את הבקשה?",
            answer: "אפשר לבטל את הבקשה כל עוד היא עדיין לא יצאה לטיפול.  אם התהליך כבר התחיל – לא ניתן לבטל, אבל תמיד אפשר לפנות אלינו וננסה לעזור."
        }
    ];

 
  return (
    <div className="homebefore_approval_page">
        <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
        <div className="wrapper">
            <h1>ברוכים הבאים, דני</h1>
            <div className="bank_title">
                <span><img src={hapoalimbankicon} alt="" /></span>
                <h3>בנק הפועלים</h3>
            </div>
            <div className="awaiting_approval_box">
                <div className="tag"> <img src={timeicon} alt="" />ממתין לאישור הבנק </div>
                <ul className="d_flex d_flex_jc">
                    <li>
                        <span>1</span>
                        <h3>שליחת בקשה</h3>
                    </li>
                    <li>
                        <span>2</span>
                        <h3>אישור עקרוני</h3>
                    </li>
                </ul>
            </div>
            <div className="inner d_flex d_flex_jb">
                <div className="right_col">
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
                <div className="left_col">
                    <div className="offer_col">
                        <img src={offericon} alt="" />
                        <h4>מידע חשוב</h4>
                        <p>הבקשה לאישור העקרוני נמצאת בבדיקת הבנק ויכולה להימשך עד 5 ימי עסקים. ברגע שהבנק יסיים את הטיפול ויתקבל מענה, נעדכן אותך אוטומטית בהודעה במערכת ובאימייל.</p>
                    </div>
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
            </div>
        </div>
        <div className="next_prev_box">
            <a href="/" className="prev"><img src={nextprevarrow} alt="" /></a>
            <a href="/" className="next"><img src={nextprevarrow} alt="" /></a>
        </div>
    </div>  
  );
};

export default HomeBeforeApproval;