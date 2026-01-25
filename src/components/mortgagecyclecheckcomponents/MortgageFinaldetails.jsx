import React from "react";


const MortgageFinaldetails = ({ bankId, amount, onBankIdChange, onAmountChange }) => {
  const bankOptions = [
    { value: "1", label: "מזרחי-טפחות" },
    { value: "2", label: "לאומי" },
    { value: "3", label: "הפועלים" },
    { value: "4", label: "דיסקונט" },
    { value: "8", label: "הבינלאומי" },
    { value: "12", label: "מרכנתיל" },
  ];

  return (
    <div className="mortgage_finaldetails">
        <h2>השלמת פרטים אחרונים</h2>
        <div className="inner">
            <div className="colin">
              <h4>שם בנק בו קיימת המשכנתא:</h4>
              <select
                value={bankId}
                onChange={(e) => onBankIdChange(e.target.value)}
                className="in"
              >
                <option value="">בחר</option>
                {bankOptions.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="colin">
              <h4>מחיר הנכס: (משוערך)</h4>
              <input
                type="text"
                inputMode="numeric"
                className="in"
                placeholder="נא להקליד כאן סכום..."
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
              />
            </div>
        </div>
    </div>
  );
};

export default MortgageFinaldetails;
