// Homepage.jsx
import React from "react";
import '../components/viewofferscomponents/ViewOfferspage.css';

import logobankicon from "../assets/images/bank_hapoalim.png";
import offer_i from "../assets/images/offer_i.png";
import nextprevarrow from "../assets/images/np_arrow.svg";

// page components
import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';
import AffordableOffer from '../components/viewofferscomponents/AffordableOffer';
import BankOfferList from '../components/viewofferscomponents/BankOfferList';
import BankExpireDayList from '../components/viewofferscomponents/BankExpireDayList';

const ViewOfferspage = () => {

    const mortgageData3 = {
        logobank:logobankicon,
        title: "המשכנתא שלך:",
        expireoffertext:'יפוג עוד 21 יום',
        details: {
            bank: "בנק הפועלים",
            amount: "₪1,500,000",
            years: "30",
            firstMonthlyPayment: "₪7,982",
            maxMonthlyPayment: "₪8,330",
        },
        totalPayments: "₪1,458,966",
    };

  return (
    <div className="viewoffers_page">
        <div className="wrapper">
            <h1>ברוכים הבאים, דני</h1>
            <YourRoutesMortgageDetails data={mortgageData3} themeColor="#D92D20" />
            <div className="inner d_flex d_flex_jb">
                <AffordableOffer />
                <div className="offer_col">
                  <img src={offer_i} alt="" />
                  <h4>נא לשים לב</h4>
                  <p>בנק מזרחי ממתין למסמכי עו”ש על מנת להפניק הצעה עדכנית, נא לקדם את הנושא</p>
                </div>
                <div className="my_statuses_summary_sec d_flex d_flex_jb d_flex_as">
                    <h2>ריכוז הסטטוסים שלי</h2>
                    <BankOfferList />
                    <BankExpireDayList />
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

export default ViewOfferspage;