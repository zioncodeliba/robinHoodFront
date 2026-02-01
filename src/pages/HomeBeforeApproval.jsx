// Homepage.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import nextprevarrow from "../assets/images/np_arrow.svg";
import hapoalimbankicon from "../assets/images/bank_hapoalim.png";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";
import discountbankicon from "../assets/images/bank_discount.svg";
import internationalbankicon from "../assets/images/bank_international.svg";
import mercantilebankicon from "../assets/images/bank_mercantile.svg";
import timeicon from "../assets/images/tt.png";
import offericon from "../assets/images/offer_i.png";
import previcon from '../assets/images/prev_icon.png';

// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';


const HomeBeforeApproval = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const bankIdParam = Number(params.get("bankId"));
    const statusKey = params.get("status");
    const statusTextParam = params.get("statusText");

    const bankMap = {
        1: { name: "בנק מזרחי טפחות", logo: mizrahitefahotbank },
        2: { name: "בנק לאומי", logo: nationalbank },
        3: { name: "בנק הפועלים", logo: hapoalimbankicon },
        4: { name: "בנק דיסקונט", logo: discountbankicon },
        8: { name: "בנק הבינלאומי", logo: internationalbankicon },
        12: { name: "בנק מרכנתיל", logo: mercantilebankicon }
    };

    const statusLabels = {
        sent: "בקשה נשלחה לבנק",
        awaiting_approval: "ממתין לאישור הבנק",
        final_approval: "אישור סופי",
        declined: "הבקשה נדחתה",
        in_review: "בבדיקה"
    };

    const bankOrder = [3, 2, 1, 4, 8, 12];
    const activeBankId = bankOrder.includes(bankIdParam) ? bankIdParam : bankOrder[0];
    const selectedBank = bankMap[activeBankId] || bankMap[bankOrder[0]];
    const statusLabel = statusTextParam || statusLabels[statusKey] || statusLabels.awaiting_approval;
    const activeIndex = bankOrder.indexOf(activeBankId);
    const prevBankId = bankOrder[(activeIndex - 1 + bankOrder.length) % bankOrder.length];
    const nextBankId = bankOrder[(activeIndex + 1) % bankOrder.length];

    const buildBankLink = (bankId) => {
        const nextParams = new URLSearchParams();
        nextParams.set("bankId", String(bankId));
        if (statusKey) {
            nextParams.set("status", statusKey);
        }
        if (statusTextParam) {
            nextParams.set("statusText", statusTextParam);
        }
        return `/homebeforeapproval?${nextParams.toString()}`;
    };

    const prevLink =
        activeIndex === 0 ? "/homebeforeapproval2" : buildBankLink(prevBankId);
    const nextLink =
        activeIndex === bankOrder.length - 1
            ? "/homebeforeapproval2"
            : buildBankLink(nextBankId);

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
                <span><img src={selectedBank.logo} alt="" /></span>
                <h3>{selectedBank.name}</h3>
            </div>
            <div className="awaiting_approval_box">
                <div className="tag"> <img src={timeicon} alt="" />{statusLabel} </div>
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
            <a href={prevLink} className="prev"><img src={nextprevarrow} alt="" /></a>
            <a href={nextLink} className="next"><img src={nextprevarrow} alt="" /></a>
        </div>
    </div>  
  );
};

export default HomeBeforeApproval;
