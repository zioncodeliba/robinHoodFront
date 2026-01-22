import React from "react";
import closeicon from '../../assets/images/close_popup.png';

const MortgageConversionFreePopup = () => {
 

  return (
    <div className="mortgage_conversion_free_popup">
      <span className="colse"><img src={closeicon} alt="" /></span>
      <div className="text">
        <h3>בדקו בחינם כדאיות למחזור משכנתא!</h3>
        <p>העלו דוח יתרה לסילוק, ותוך פחות מ־60 שניות תדעו אם משתלם לכם למחזר את המשכנתא.</p>
        <h3>הסבר על מסמך משכנתא</h3>
        <p>
          מסמך משכנתא או בשמו הרשמי <br/>
“דוח יתרה לסילוק משכנתא” <br/>
הינו דוח אשר מציג את הסכום המדויק לסגירת המשכנתא. דוח זה הכרחי לבדיקת כדאיות למחזור משכנתא. <br/>
את הדוח משיגים מהבנק בו מתנהלת המשכנתא דרך אפליקצית הבנק/ אתר הבנק /הסניף.
        </p>
        <h3>הסבר על מחזור משכנתא</h3>
        <p>מחזור משכנתא הוא החלפת המשכנתא הקיימת בחדשה באותו בנק או בבנק אחר כדי לשפר תנאים (ריבית, תקופה ותשלום חודשי). </p>
      </div>
    </div>
  );
};

export default MortgageConversionFreePopup;
