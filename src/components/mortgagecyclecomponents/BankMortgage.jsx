// Homepage.jsx
import React from "react";

import noteicon from '../../assets/images/note_i.png'


const BankMortgage = ({ data }) => {

    const bankData = data || {
        name: "בנק לאומי",
        icon: "/banks/leumi.png",
        color: "#007BFF",
        tag: "המשכנתא שלך",
        details: [
            { title: "יתרה לסילוק המשכנתא", value: "₪1,700,000" },
            { title: "תקופה בשנים", value: "25" },
            { title: "תשלום חודשי", value: "₪8,330" },
            { title: "ריבית שנתית כוללת", value: "4.1%" },
            { title: "סך הכל תשלומים", value: "₪2,700,000" },
            { title: "החזר לשקל", value: "1.2" },
            { title: "הצמדה למדד", value: "₪100,524" }
        ]
    };
    const cardColor = bankData?.color || "#4E8FF7";



  return (
    <>
      <div className="bank_mortgage_sec" style={{ '--color': cardColor }}>
        {bankData.icon && (
          <div className="bank_icon">
            <img src={bankData.icon} alt={bankData.name} />
          </div>
        )}
        <h2>{bankData.name}</h2>
        <div className="tag">{bankData.tag}</div>
        <ul className="d_flex">
          {bankData.details.map((item, index) => (
            <li key={index} className={`detail_item detail_${index + 1}`}>
              <h3 className="detail_title">{item.title}</h3>
              <p className="detail_value">{item.value}</p>
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
