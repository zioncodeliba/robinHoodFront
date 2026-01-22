// Homepage.jsx
import React from "react";

import nationalbank from '../../assets/images/national_bank.svg';
// import hapoalimbank from '../../assets/images/bank_hapoalim.svg';
// import mizrahitefahotbank from '../../assets/images/mizrahi_tefahot_bank.svg';

const BankOfferList = () => {

  return (
        <div className="bank_offer_list">                                   
            <ul>
                <li>
                    <span><img src={nationalbank} alt="" /></span>
                    <h4>בנק לאומי</h4>
                </li>
                <li><a href="/approval-status" className="final_approval">אישור סופי</a></li>
            </ul>
            <div className="most_offer"> ההצעה המשתלמת ביותר </div> 
        </div>
  );
};

export default BankOfferList;