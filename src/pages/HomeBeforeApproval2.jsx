// Homepage.jsx
import React from "react";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import nextprevarrow from "../assets/images/np_arrow.svg";
import timeicon from "../assets/images/tt.png";
import offericon from "../assets/images/offer_i.png";
import sandicon from "../assets/images/sandicon.png";

import hapoalimbankicon from "../assets/images/bank_hapoalim.png";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";


// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';
import StatusSummary from '../components/commoncomponents/StatusSummary';


const HomeBeforeApproval2 = () => {

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
    // statusData
    const statusData = {
        title: "ריכוז הסטטוסים שלי",
        // offertext: "ההצעה המשתלמת ביותר",
        list: [
            {
                bankLogo: hapoalimbankicon,
                bankName: "בנק הפועלים",
                statusText: "ממתין לאישור עקרוני",
                statusClass: "awaiting_approval",
                link: "/approval-status"
            },
            {
                bankLogo: nationalbank,
                bankName: "בנק לאומי",
                statusText: "ממתין לאישור עקרוני",
                statusClass: "awaiting_approval",
                link: "/approval-status"
            },
            {
                bankLogo: mizrahitefahotbank,
                bankName: "בנק מזרחי טפחות",
                statusText: "אישור סופי",
                statusClass: "final_approval",
                link: "/approval-status"
            }
        ]
    };
 
  return (
    <div className="homebefore_approval_page">
        <div className="wrapper">
            <h1>ברוכים הבאים, דני</h1>
            <div className="bank_title">
                <span><img src={hapoalimbankicon} alt="" /></span>
                <h3>בנק הפועלים</h3>
            </div>
            <div className="awaiting_approval_box">
                <div className="tag"> <img src={timeicon} alt="" />ממתין לאישור הבנק </div>
                <img src={sandicon} className="sandicon" alt="" />
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
                    <StatusSummary statusData={statusData} />
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

export default HomeBeforeApproval2;