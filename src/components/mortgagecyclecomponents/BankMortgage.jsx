// Homepage.jsx
import React from "react";

import nationalbankicon from '../../assets/images/national_bank_icon.jpg'
import noteicon from '../../assets/images/note_i.png'


const BankMortgage = ({ data }) => {

    const bankData = data || {
        name: "בנק לאומי",
        icon: nationalbankicon,
        tag: "המשכנתא שלך",
        details: [
            { title: "סכום", value: "₪1,500,000" },
            { title: "יתרה לסילוק המשכנתא", value: "₪1,700,000" },
            { title: "תשלום חודשי", value: "₪8,330" },
            { title: "ריבית שנתית כוללת", value: "₪8,330" },
            { title: "סף הכל תשלומים", value: "₪2,700,000" },
            { title: "החזר לשקל", value: "₪2.10" }
        ]
    };



  return (
    <>
      <div className="bank_mortgage_sec">
        {bankData.icon && (
          <div className="bank_icon">
            <img src={bankData.icon} alt={bankData.name} />
          </div>
        )}
        <h2>{bankData.name}</h2>
        <div className="tag">{bankData.tag}</div>
        <ul className="d_flex">
          {bankData.details.map((item, index) => (
            <li key={index}>
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="routs_note">
        <img src={noteicon} alt="" />
        <p>הסבר על המסלולים</p>
      </div>
    </>
  );
};

export default BankMortgage;
