// Homepage.jsx
import React from "react";

import offermanImage from "../../assets/images/offer_man.png";

const AffordableOffer = () => {

  return (
    <div className="affordable_offer_sec">
        <img src={offermanImage} alt="" />
        <h3>ההצעה המשתלמת ביותר 
חוסכת לך:</h3>
        <h4><i>₪</i>285,000</h4>
        <a href="/schedulemeetings" className="btn">לבניית תמהיל מותאם אישית לחץ כאן</a>
    </div>  
  );
};

export default AffordableOffer;