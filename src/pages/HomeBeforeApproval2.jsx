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
import discountbankicon from "../assets/images/bank_discount.svg";
import internationalbankicon from "../assets/images/bank_international.svg";
import mercantilebankicon from "../assets/images/bank_mercantile.svg";
import allbanksicon from "../assets/images/bank_all.svg";


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
                statusText: "בקשה נשלחה",
                statusClass: "awaiting_approval",
                link: "/homebeforeapproval?bankId=3&status=sent"
            },
            {
                bankLogo: nationalbank,
                bankName: "בנק לאומי",
                statusText: "בקשה נשלחה",
                statusClass: "awaiting_approval",
                link: "/homebeforeapproval?bankId=2&status=sent"
            },
            {
                bankLogo: mizrahitefahotbank,
                bankName: "בנק מזרחי טפחות",
                statusText: "בקשה נשלחה",
                statusClass: "awaiting_approval",
                link: "/homebeforeapproval?bankId=1&status=sent"
            },
            {
                bankLogo: discountbankicon,
                bankName: "בנק דיסקונט",
                statusText: "בקשה נשלחה",
                statusClass: "awaiting_approval",
                link: "/homebeforeapproval?bankId=4&status=sent"
            },
            {
                bankLogo: internationalbankicon,
                bankName: "בנק הבינלאומי",
                statusText: "בקשה נשלחה",
                statusClass: "awaiting_approval",
                link: "/homebeforeapproval?bankId=8&status=sent"
            },
            {
                bankLogo: mercantilebankicon,
                bankName: "בנק מרכנתיל",
                statusText: "בקשה נשלחה",
                statusClass: "awaiting_approval",
                link: "/homebeforeapproval?bankId=12&status=sent"
            }
        ]
    };
 
  return (
    <div className="homebefore_approval_page">
        <div className="wrapper">
            <h1>ברוכים הבאים, דני</h1>
            <div className="bank_title">
                <span><img src={allbanksicon} alt="" /></span>
                <h3>הבקשה נשלחה לכל הבנקים</h3>
            </div>
            <div className="awaiting_approval_box">
                <div className="tag"> <img src={timeicon} alt="" />בקשה נשלחה לבנקים </div>
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
            <a href="/homebeforeapproval?bankId=12&status=sent" className="prev"><img src={nextprevarrow} alt="" /></a>
            <a href="/homebeforeapproval?bankId=3&status=sent" className="next"><img src={nextprevarrow} alt="" /></a>
        </div>
    </div>  
  );
};

export default HomeBeforeApproval2;
