// Homepage.jsx
import React from "react";
import '../components/nooffercompomponents/NoofferFoundpage.css';

import logobankicon from "../assets/images/bank_hapoalim.png";
import mirroricon from "../assets/images/mirror.png";

import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';
// import RoutesMortgageDetails from '../components/mortgagecyclecomponents/RoutesMortgageDetails';



const NoofferFoundpage = () => {

  const mortgageData2 = {
      logobank: logobankicon,
      title: "המשכנתא שלך:",
      details: {
        bank: 'בנק הפועלים',
        amount: "₪1,500,000",
        years: "30",
        firstMonthlyPayment:"₪7,982",
        maxMonthlyPayment: "₪8,330",
      },
      totalPayments: "₪1,458,966",
      note: {
        text:"הסבר על המסלולים",
      },
      routes: {
        headers: ["מסלול", "ריבית", "יתרה"],
        list: [
            { name: 'ק"צ', percentage: "40%", interest: "5%", balance: "₪640,000" },
            { name: 'מ"צ', percentage: "40%", interest: "5%", balance: "₪368,000" },
            { name: 'פריים', percentage: "40%", interest: "5%", balance: "₪592,000" },
          ],
        totals: {
          indexLinked: "100,000 ש\"ח",
          overall: "1,700,000 ש\"ח",
        },
      },
  };



  return (
    <div className="no_offer_found_page">
      <h1>בדיקת מחזור משכנתא</h1>
      <h2>נא לעלות את מסמכי המשכנתא הנוכחית שלכם </h2>
      <div className="check_nav d_flex d_flex_ac d_flex_jc">
        <span className="number">1</span>
        <span className="title">תוצאות</span>
      </div>
      <div className="wrapper d_flex d_flex_jb d_flex_as">       
        <div className="right_col">
          <div className="mirror_col">
            <img src={mirroricon} alt="" />
            <h2>בדקנו ואין כדאיות כרגע למחזור את <br/> המשכנתא</h2>
            <p>המשכנתא שלך נמצאת בתנאים האופטימליים <br/>
                אך אל דאגה פיתחנו אלגוריתם חכם שיודע לנטר את המשכנתא שלך וברגע שימצא חיסכון להתריע מיידית.
             </p>
          </div>
        </div>
        <div className="left_col">
          <YourRoutesMortgageDetails data={mortgageData2} themeColor="#D92D20" />         
        </div>
      </div>
    </div>  
  );
};

export default NoofferFoundpage;