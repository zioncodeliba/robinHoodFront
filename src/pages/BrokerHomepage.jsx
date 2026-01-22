// Homepage.jsx
import React from "react";
import '../components/brokercomponents/BrokerHomepage.css';

import brokerhomeImage from '../assets/images/broker_img.png';

// components
import BrokerInfo from '../components/brokercomponents/BrokerInfo';
import BrokerStatementList from '../components/brokercomponents/BrokerStatementList';

const BrokerHomepage = () => {

  const statementData = {
    // Column 1 Data
    colin1: [
      { customerName: "אברהם כהן", status: "אישור עקרוני", step: "לא קיבל הצעות", stepClass: "no_offer_received" },
      { customerName: "שרה לוי", status: "בקשה נשלחה", step: "לא נרשם", stepClass: "not_registered" },
      { customerName: "יוסף דוד", status: "אישור עקרוני", step: "התקבלה הצעה", stepClass: "offer_accepted" },
    ],
    // Column 2 Data
    colin2: [
      { customerName: "משה יעקב", status: "אישור עקרוני", step: "התקבלה הצעה", stepClass: "offer_accepted" },
      { customerName: "רחל בן-ארי", status: "בקשה נשלחה", step: "לא קיבל הצעות", stepClass: "no_offer_received" },
      { customerName: "דניאל חיים", status: "אושר", step: "לא נרשם", stepClass: "not_registered" },
      { customerName: "test4", status:"test5", step: "test6", stepClass: "offer_accepted" }
    ],
    // Column 3 Data
    colin3: [
      { customerName: "אליהו גולן", status: "אושר", step: "התקבלה הצעה", stepClass: "offer_accepted" },
      { customerName: "מרים עמר", status: "אישור עקרוני", step: "לא קיבל הצעות", stepClass: "no_offer_received" },
      { customerName: "שאול ישראלי", status: "בקשה נשלחה", step: "לא נרשם", stepClass: "not_registered" },
      { customerName: "test7", status:"test8", step: "test9", stepClass: "offer_accepted" },
      { customerName: "אוריאל לוי", status: "אושר", step: "התקבלה הצעה", stepClass: "offer_accepted" }
    ]
  };

  return (
    <div className="broker_homepage">
      <div className="wrapper">
        <h1>ברוך הבא, דני</h1>
        <BrokerInfo />
        <BrokerStatementList data={statementData} />
        <img src={brokerhomeImage} className="brokerhome_image" alt="" />
      </div>
    </div>  
  );
};

export default BrokerHomepage;