// Homepage.jsx
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import '../components/mortgagecyclecomponents/MortgageCyclepage.css';

import prevIcon from '../assets/images/prev_icon.png';
import congoIcon from '../assets/images/congo_icon.png';
import offerman from '../assets/images/offer_man.png';

// page components
import BankMortgage from '../components/mortgagecyclecomponents/BankMortgage';
import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';
import SavingsList from '../components/mortgagecyclecomponents/SavingsList';
import BarChartsavings from '../components/mortgagecyclecomponents/BarChartsavings';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import {
  buildBankMortgageData,
  buildMortgageDataFromOptimal,
  loadMortgageCycleResult,
} from "../utils/mortgageCycleResult";


const MortgageCyclePage = () => {
  const location = useLocation();
  const storedResult = useMemo(() => loadMortgageCycleResult(), []);
  const bankResponse = location.state?.bankResponse || storedResult;
  const bankMortgageData = useMemo(
    () => buildBankMortgageData(bankResponse),
    [bankResponse]
  );
  const { mortgageData } = useMemo(
    () => buildMortgageDataFromOptimal(bankResponse),
    [bankResponse]
  );

  const mortgageCycleData = {
    "1": [
      { "name": "ינואר", "rivit": 2000, "keren": 2000 },
      { "name": "פברואר", "rivit": 3000, "keren": 3200 },
      { "name": "מרץ", "rivit": 3200, "keren": 3600 },
      { "name": "אפריל", "rivit": 3100, "keren": 4650 },
      { "name": "מאי", "rivit": 3300, "keren": 4200 },
      { "name": "יוני", "rivit": 3500, "keren": 4400 },
      { "name": "יולי", "rivit": 3400, "keren": 4100 }
    ]
  }

  return (
    <div className="mortgage_cycle_page">
      <a href="/" className="prev_page_link"><img src={prevIcon} alt="" /></a>
      <h1>בדיקת מחזור משכנתא</h1>
      <h2>נא לעלות את מסמכי המשכנתא הנוכחית שלכם </h2>
      <div className="check_nav d_flex d_flex_ac d_flex_jc">
        <span className="number">1</span>
        <span className="title">תוצאות</span>
      </div>
      <div className="wrapper d_flex d_flex_jb d_flex_as">
        <div className="congratulation d_flex d_flex_ac">
          <div className="img"><img src={congoIcon} alt="" /></div>
          <div className="text">
            <h3>ברכות</h3>
            <p>מצאנו בשבילך חיסכון <br/> משמעותי במשכנתא</p>
          </div>
        </div>
        <div className="right_col">
          <BankMortgage data={bankMortgageData} />
          {/* <YourRoutesMortgageDetails /> */}
          <YourRoutesMortgageDetails data={mortgageData} themeColor="#4E8FF7" />
          {/* <RoutesMortgageDetails /> */}
          <div className="comparison_graph">
            {/* <ReturnsChart charttitle={'גרף השוואה'} interest={'משכנתא נוכחית'} fund={'משכנתא לאחר מחזור'} /> */}
            <ReturnsChart 
              charttitle={'גרף השוואה'} 
              interest={'משכנתא נוכחית'} 
              fund={'משכנתא לאחר מחזור'} 
              dataSets={mortgageCycleData}
            />
          </div>
        </div>
        <div className="left_col">
          <div className="total_savings_box">
            <div className="box">
              <h4>חיסכון כולל:</h4>
              <h2>₪245,600</h2>
              <img src={offerman} className="mobile_img" alt="" />
            </div>
            <p>זה הסכום שתחסכו עד סוף תקופת המשכנתא.</p>
            <a href="/" className="btn"> 
              <em className="desktop_img">למחזור משכנתא לחץ כאן</em>
              <em className="mobile_img">לתיאום שיחת מחזור משכנתא לחץ כאן</em>
            </a>
            <span>השיחה ללא עלות וללא התחייבות</span>
          </div>
          <SavingsList />
          <div className="barchart_sec">
            <h3>חיסכון לפי שנים</h3>
            <BarChartsavings />
          </div>
        </div>
      </div>
    </div>  
  );
};

export default MortgageCyclePage;
