import React from "react";
import closeicon from '../../assets/images/close_popup.png';

const MortgageFileErrorPopup = () => {
 

  return (
    <div className="mortgage_fileError_popup">
      <span className="colse"><img src={closeicon} alt="" /></span>
      <div className="text">
        <h3>שגיאה בקובץ</h3>
        <p>יש לצרף דוח יתרות רשמי שהתקבל מהבנק כקובץ PDF</p>
      </div>
        <button className="confirmation">אישור </button>
    </div>
  );
};

export default MortgageFileErrorPopup;
