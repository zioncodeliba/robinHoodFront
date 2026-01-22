import React from "react";


const MortgageFinaldetails = () => {
 

  return (
    <div className="mortgage_finaldetails">
        <h2>השלמת פרטים אחרונים</h2>
        <div className="inner">
            <div className="colin">
              <h4>שם בנק בו קיימת המשכנתא:</h4>
              <select name="" className="in">
                <option value="">בחר</option>
                <option value="bank 1">bank 1</option>
                <option value="bank 2">bank 2</option>
              </select>
            </div>
            <div className="colin">
              <h4>מחיר הנכס: (משוערך)</h4>
              <input type="text" className="in" placeholder="נא להקליד כאן סכום..." />
            </div>
        </div>
    </div>
  );
};

export default MortgageFinaldetails;
