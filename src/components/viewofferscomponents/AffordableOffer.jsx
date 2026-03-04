// Homepage.jsx
import React from "react";

import offermanImage from "../../assets/images/viewoffer_figure.png";

const AffordableOffer = ({ savings }) => {
  const hasSavings = Number.isFinite(savings);
  const formattedSavings = hasSavings
    ? Math.round(savings).toLocaleString('he-IL')
    : '—';

  return (
    <div className="affordable_offer_sec">
        <img src={offermanImage} alt="" />
        <h3>ההצעה המשתלמת ביותר 
חוסכת לך:</h3>
        <h4>{hasSavings ? (<><i>₪</i>{formattedSavings}</>) : '—'}</h4>
        <a href="/schedulemeetings" className="btn">לבניית תמהיל מותאם אישית לחץ כאן</a>
    </div>  
  );
};

export default AffordableOffer;
