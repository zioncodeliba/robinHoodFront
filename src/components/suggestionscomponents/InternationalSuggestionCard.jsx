import React from "react";

const formatMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return "—";
  }
  return `₪${num.toLocaleString("he-IL")}`;
};

const getStatusText = (status) => {
  if (!status?.type) return "";
  if (status.type === "final") return "אישור סופי";
  if (status.type === "conditional") {
    return `אישור עקרוני ${status.time || ""}`.trim();
  }
  return "";
};

const InternationalSuggestionCard = ({ bankData }) => {
  const statusText = getStatusText(bankData?.status);
  const statusClassName = bankData?.status?.type === "final" ? "final_approval" : "conditional_approval";
  const logoSrc = bankData?.bankLogo || "/banks/international-logo.png";

  return (
    <div
      className="bank_mortgage_card bank_mortgage_card_international"
      style={{ "--color": bankData?.color || "#FDB726" }}
    >
      <div className="bank_icon bank_icon_international">
        <img src={logoSrc} alt={bankData?.name || "בנק הבינלאומי"} />
      </div>
      {statusText ? <div className={`tag ${statusClassName}`}>{statusText}</div> : null}
      <h2>{bankData?.name || "בנק הבינלאומי"}</h2>
      <ul className="d_flex">
        <li>
          <h3>סכום</h3>
          <p>{formatMoney(bankData?.amount)}</p>
        </li>
        <li>
          <h3>תקופה בשנים</h3>
          <p>{bankData?.years ?? "—"}</p>
        </li>
        <li>
          <h3>תשלום חודשי מקסימלי צפוי</h3>
          <p>{formatMoney(bankData?.maxMonthlyPayment)}</p>
        </li>
        <li>
          <h3>תשלום חודשי ראשון</h3>
          <p>{formatMoney(bankData?.firstMonthlyPayment)}</p>
        </li>
        <li>
          <h3>סך הכל תשלומים</h3>
          <p>{formatMoney(bankData?.totalPayments)}</p>
        </li>
      </ul>
    </div>
  );
};

export default InternationalSuggestionCard;
