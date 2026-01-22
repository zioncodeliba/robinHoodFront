
import React from "react";
import '../components/newmortgagecomponents/newmortgagepage.css';
import HomeImage from '../assets/images/h_img1.png';
import offer_i from '../assets/images/offer_i.png';
import robin_man from '../assets/images/robin_man.png';

import hapoalimbankicon from "../assets/images/bank_hapoalim.png";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";


import RoutesExplanation from '../components/newmortgagecomponents/RoutesExplanation';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import StatusSummary from '../components/commoncomponents/StatusSummary';

const MortgagePage = () => {

  const mortgagechartdata ={
      "1": [
      { "name": "ינואר", "rivit": 2000, "keren": 2000 },
      { "name": "פברואר", "rivit": 3000, "keren": 3200 },
      { "name": "מרץ", "rivit": 3200, "keren": 3600 },
      { "name": "אפריל", "rivit": 3100, "keren": 4650 },
      { "name": "מאי", "rivit": 3300, "keren": 4200 },
      { "name": "יוני", "rivit": 3500, "keren": 4400 },
      { "name": "יולי", "rivit": 3400, "keren": 4100 }
    ],
    "2": [
      { "name": "ינואר", "rivit": 2200, "keren": 6000 },
      { "name": "פברואר", "rivit": 3000, "keren": 5000 },
      { "name": "מרץ", "rivit": 3200, "keren": 4000 },
      { "name": "אפריל", "rivit": 3100, "keren": 3000 },
      { "name": "מאי", "rivit": 3300, "keren": 3500 },
      { "name": "יוני", "rivit": 3500, "keren": 3000 },
      { "name": "יולי", "rivit": 3400, "keren": 3100 }
    ],
    "3": [
      { "name": "ינואר", "rivit": 6000, "keren": 2000 },
      { "name": "פברואר", "rivit": 5000, "keren": 3200 },
      { "name": "מרץ", "rivit": 4000, "keren": 3600 },
      { "name": "אפריל", "rivit": 3000, "keren": 4650 },
      { "name": "מאי", "rivit": 3500, "keren": 4200 },
      { "name": "יוני", "rivit": 3000, "keren": 4400 },
      { "name": "יולי", "rivit": 3100, "keren": 4100 }
    ]
  }

   // statusData
    const statusData = {
        title: "ריכוז הסטטוסים שלי",
        offertext: "ההצעה המשתלמת ביותר",
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
    <div className="mortgagepage">
      <div className="das_top_title">
        <h1>ברוכים הבאים, דני</h1>
        <h2>הבנק שנבחר לצורך המשכנתא</h2>
        <div className="bank_title">
          <span></span>
          <h3>בנק הפועלים</h3>
        </div>
      </div>
      <div className="wrapper d_flex">
        <img src={HomeImage} className="homeimage" alt="" />
          <div className="right_col">
            <RoutesExplanation />
            {/* <ReturnsChart charttitle={'החזרים'} interest={'ריבית'} fund={'קרן'} /> */}
            <ReturnsChart 
            charttitle={'החזרים'} 
            interest={'ריבית'} 
            fund={'קרן'} 
            dataSets={mortgagechartdata} 
          />
          </div>
          <div className="left_col">
              <div className="offer_box">
                <img src={robin_man} className="robin_man" alt="" />
                <div className="offer_col">
                  <img src={offer_i} alt="" />
                  <h4>ההצעה זו חסכה לך:</h4>
                  <h5><em>₪</em>285,000</h5>
                </div>
              </div>
              <StatusSummary statusData={statusData} />
          </div>
      </div>
    </div>
  );
};

export default MortgagePage;