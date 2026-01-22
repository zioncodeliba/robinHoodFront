// Homepage.jsx
import React from "react";

import hapoalimbank from '../../assets/images/bank_hapoalim.svg';
import mizrahitefahotbank from '../../assets/images/mizrahi_tefahot_bank.svg';
// import nationalbank from '../../assets/images/national_bank.svg';

const BankExpireDayList = () => {

  return (
        <div className="bank_expireday_list">                       
            <ul>
                <li>
                    <span><img src={hapoalimbank} alt="" /></span>
                    <h4>בנק הפועלים</h4>
                </li>
                <li><a href="/approval-status" className="expire">אישור עקרוני יפוג עוד 10 יום</a></li>
            </ul>          
            <ul>
                <li>
                    <span><img src={mizrahitefahotbank} alt="" /></span>
                    <h4>בנק מזרחי טפחות</h4>
                </li>
                <li><a href="/approval-status" className="expire">אישור עקרוני יפוג עוד 10 יום</a></li>
            </ul>        
        </div>
  );
};

export default BankExpireDayList;