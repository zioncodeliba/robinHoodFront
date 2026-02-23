import React from "react";

const NoOfferCard = ({
  title,
  details,
  totalPayments,
  themeColor,
  bankLogo,
  bankName,
  mobileBankCardData,
}) => {
  const resolvedLogo = bankLogo || "/banks/hapoalim.png";
  const logoAlt = bankName ? `לוגו ${bankName}` : "לוגו בנק";
  const fallbackMobileDetails = [
    { title: "בנק", value: details?.bank || "—" },
    { title: "סכום", value: details?.amount || "—" },
    { title: "תקופה בשנים", value: details?.years || "—" },
    { title: "תשלום חודשי ראשון", value: details?.firstMonthlyPayment || "—" },
    { title: "תשלום חודשי מקסימלי", value: details?.maxMonthlyPayment || "—" },
    { title: "סך הכל תשלומים", value: totalPayments || "—" },
    { title: "הצמדה למדד", value: "—" },
  ];
  const mobileCard = {
    name: mobileBankCardData?.name || details?.bank || bankName || "בנק",
    icon: mobileBankCardData?.icon || resolvedLogo,
    color: mobileBankCardData?.color || themeColor || "#4E8FF7",
    tag: mobileBankCardData?.tag || "המשכנתא שלך",
    details:
      Array.isArray(mobileBankCardData?.details) && mobileBankCardData.details.length > 0
        ? mobileBankCardData.details
        : fallbackMobileDetails,
  };

  return (
    <>
      <div className="routes_mobile no_offer_card_desktop">
        <div className="bank_logo">
          <img src={resolvedLogo} alt={logoAlt} />
        </div>
        {title && <h2>{title}</h2>}
        {details &&
          details.bank &&
          details.amount &&
          details.years &&
          details.firstMonthlyPayment &&
          details.maxMonthlyPayment && (
            <ul className="emi_details d_flex">
              <li>
                <p>בנק</p>
                <h3>{details.bank}</h3>
              </li>
              <li>
                <p>סכום</p>
                <h3>{details.amount}</h3>
              </li>
              <li>
                <p>תקופה בשנים</p>
                <h3>{details.years}</h3>
              </li>
              <li>
                <p>תשלום חודשי ראשון</p>
                <h3>{details.firstMonthlyPayment}</h3>
              </li>
              <li>
                <p>תשלום חודשי מקסימלי</p>
                <h3>{details.maxMonthlyPayment}</h3>
              </li>
            </ul>
          )}
        {totalPayments && (
          <div className="total_payments" style={{ borderColor: themeColor }}>
            <p>סך הכל תשלומים </p>
            <h4 style={{ color: themeColor }}>{totalPayments}</h4>
          </div>
        )}
      </div>

      <div className="no_offer_mobile_bank_card">
        <div className="bank_mortgage_sec" style={{ "--color": mobileCard.color }}>
          {mobileCard.icon && (
            <div className="bank_icon">
              <img src={mobileCard.icon} alt={mobileCard.name} />
            </div>
          )}
          <h2>{mobileCard.name}</h2>
          <div className="tag">{mobileCard.tag}</div>
          <ul className="d_flex">
            {mobileCard.details.map((item, index) => (
              <li key={index} className={`detail_item detail_${index + 1}`}>
                <h3 className="detail_title">{item.title}</h3>
                <p className="detail_value">{item.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default NoOfferCard;
