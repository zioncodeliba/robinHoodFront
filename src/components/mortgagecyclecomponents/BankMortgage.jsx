// Homepage.jsx
import React, { useState } from "react";

import noteicon from '../../assets/images/note_i.png';
import closePopupImg from '../../assets/images/close_popup.png';

const BankMortgage = ({ data }) => {
    const [notePopupOpen, setNotePopupOpen] = useState(false);

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
      <div
        className="routs_note"
        role="button"
        tabIndex={0}
        onClick={() => setNotePopupOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setNotePopupOpen(true)}
      >
        <img src={noteicon} alt="" />
        <p>הסבר על המסלולים</p>
      </div>

      {notePopupOpen && (
        <div className="note_popup note_popup open">
          <span className="close" onClick={() => setNotePopupOpen(false)}>
            <img src={closePopupImg} alt="" />
          </span>
          <div className="inner">
            <h2>בדקו בחינם כדאיות למחזור משכנתא!</h2>
            <p style={{ whiteSpace: "pre-line" }}>
              העלו דוח יתרה לסילוק, ותוך פחות מ־30 שניות תדעו אם משתלם לכם למחזר את המשכנתא.
            </p>
            <div className="col">
              <h2>הסבר על מסמך משכנתא</h2>
              <p style={{ whiteSpace: "pre-line" }}>
                מסמך משכנתא או בשמו הרשמי
                &quot;דוח יתרה לסילוק משכנתא&quot;
                הינו דוח אשר מציג את הסכום המדויק לסגירת המשכנתא. דוח זה הכרחי לבדיקת כדאיות למחזור משכנתא.
                את הדוח משיגים מהבנק בו מתנהלת המשכנתא דרך אפליקצית הבנק/ אתר הבנק /הסניף.
              </p>
            </div>
            <div className="col">
              <h2>הסבר על מחזור משכנתא</h2>
              <p style={{ whiteSpace: "pre-line" }}>
                מחזור משכנתא הוא החלפת המשכנתא הקיימת בחדשה באותו בנק או בבנק אחר כדי לשפר תנאים (ריבית, תקופה והחזר חודשי).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BankMortgage;
