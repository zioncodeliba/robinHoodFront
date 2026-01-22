import React from "react";
import "./YourRoutesMortgageDetails.css";
import noteicon from "../../assets/images/note_i.png";


const YourRoutesMortgageDetails = ({ data, themeColor }) => {
  // Fallback if no data is passed
  const mortgageData = data || {
    logobank:'',
    expireoffertext:'',
    title: "המשכנתא שלך:",
    details: {
      bank: "בנק הפועלים",
      amount: "₪1,500,000",
      years: "30",
      firstMonthlyPayment: "₪7,982",
      maxMonthlyPayment: "₪8,330",
    },
    totalPayments: "₪1,458,966",
    note: {
      text: "הסבר על המסלולים",
    },
    routes: {
      headers: ["מסלולים", "ריבית", "יתרה"],
      list: [
        { name: 'ק"צ', percentage: "40%", interest: "5%", balance: "₪640,000" },
        { name: 'מ"צ', percentage: "40%", interest: "5%", balance: "₪368,000" },
        { name: "פריים", percentage: "40%", interest: "5%", balance: "₪592,000" }
      ],
      totals: {
        indexLinked: '100,000 ש"ח',
        overall: '1,700,000 ש"ח'
      }
    }
  };

  const { logobank, title, details, totalPayments, note, routes ,expireoffertext} = mortgageData;

  return (
    <div className="routes_mortgage_sec" style={{ borderColor: themeColor , "--bgcolor": themeColor }}>

      {expireoffertext &&(
        <div className="expire_offer"><strong>אישור עקרוני</strong> {expireoffertext}</div>
      )}
      <div className="routes_mobile">
        {logobank && (
          <div className="bank_logo"><img src={logobank} alt="" /></div>
        )}
        {title && (
          <h2>{title}</h2>
        )}
        {details && details.bank && details.amount && details.years && details.firstMonthlyPayment && details.maxMonthlyPayment && (
          <ul className="emi_details d_flex" >
            <li><p>בנק</p><h3>{details.bank}</h3></li>
            <li><p>סכום</p><h3>{details.amount}</h3></li>
            <li><p>תקופה בשנים</p><h3>{details.years}</h3></li>
            <li><p>תשלום חודשי ראשון</p><h3>{details.firstMonthlyPayment}</h3></li>
            <li><p>תשלום חודשי מקסימלי</p><h3>{details.maxMonthlyPayment}</h3></li>
          </ul>
        )}
        {totalPayments && (
          <div className="total_payments" style={{ borderColor: themeColor }}>
            <p>סך הכל תשלומים </p>
            <h4 style={{ color: themeColor }}>{totalPayments}</h4>
          </div>
        )}
      </div>
      {note?.text && (
        <div className="routs_note">
          <img src={noteicon} alt="" />
          <p>{note.text}</p>
        </div>
      )}
      {routes && routes.headers && routes.list && (
        <div className="routes_explanation">
          <ul className="title_routes d_flex d_flex_ac" style={{ borderColor: themeColor }}>
            {routes.headers.map((header, i) => <li key={i} >{header}</li>)}
          </ul>

          <div className="list_routes" style={{ "--bgcolor": themeColor }}>
            {routes.list.map((route, index) => (
              <ul key={index}>
                <li style={{ borderColor: themeColor }}><span><em>({route.percentage})</em> {route.name}</span></li>
                <li style={{ borderColor: themeColor }}>{route.interest}</li>
                <li style={{ borderColor: themeColor }}>{route.balance}</li>
              </ul>
            ))}
            <div className="total" >
              <p><strong>הצמדה למדד:</strong> {routes.totals.indexLinked}</p>
              <p><strong>סה"כ: </strong>{routes.totals.overall}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourRoutesMortgageDetails;
