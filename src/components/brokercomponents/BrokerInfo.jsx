// BrokerHomepage.jsx
import React from "react";


import copyIcon from "../../assets/images/copy_icon.svg";
import withdrawalIcon from "../../assets/images/withdrawal_icon.svg";

const BrokerInfo = () => {
  return (
    <div className="broker_info_sec d_flex d_flex_jc">
        <div className="col ">
            <div className="total_comissions">סה”כ עמלות שהתקבלו: <br/>
                <strong>₪2,650</strong>
            </div>
        </div>
        <div className="col">
            <div className="your_balance">
                <span>היתרה שלך - </span><strong>₪25,000</strong>
            </div>
            <button className="withdrawal">
                <span className="icon"><img src={withdrawalIcon} alt="" /></span> <span>בקשה למשיכת יתרה</span>
            </button>
        </div>
        <div className="col">
            <div className="the_customers">
                <span>לקחות שסגרו החודש </span><strong>53</strong>
            </div>
            <button className="new_link_send">
                <span>הנפק לינק חדש לשליחה</span><img src={copyIcon} alt="" />
            </button>
        </div>
    </div>
  );
};

export default BrokerInfo;
