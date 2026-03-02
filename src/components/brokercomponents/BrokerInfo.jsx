// BrokerHomepage.jsx
import React from "react";


import copyIcon from "../../assets/images/copy_icon.svg";
import withdrawalIcon from "../../assets/images/withdrawal_icon.svg";

const formatCurrencyILS = (value) =>
  new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatCount = (value) => new Intl.NumberFormat("he-IL").format(Number(value) || 0);

const BrokerInfo = ({
  totalCreditAllTime = 0,
  balanceDue = 0,
  closedCustomersCount = 0,
  isLoading = false,
  withdrawalRequested = false,
  withdrawalSaving = false,
  onToggleWithdrawalRequest = null,
  generateLinkSaving = false,
  onGenerateNewLink = null,
  onCopyCurrentLink = null,
  copyCurrentLinkText = "העתקת לינק נוכחי",
  copyCurrentLinkDisabled = false,
}) => {
  const totalCreditText = isLoading ? "..." : formatCurrencyILS(totalCreditAllTime);
  const balanceDueText = isLoading ? "..." : formatCurrencyILS(balanceDue);
  const closedCustomersText = isLoading ? "..." : formatCount(closedCustomersCount);
  const withdrawalText = withdrawalSaving
    ? "שומר..."
    : (withdrawalRequested ? "בטל בקשת משיכה" : "בקשה למשיכת יתרה");
  const generateLinkText = generateLinkSaving ? "מנפיק לינק..." : "הנפק לינק חדש לשליחה";

  return (
    <div className="broker_info_sec d_flex d_flex_jc">
        <div className="col ">
            <div className="total_comissions">סה”כ עמלות שהתקבלו: <br/>
                <strong>{totalCreditText}</strong>
            </div>
        </div>
        <div className="col">
            <div className="your_balance">
                <span>היתרה שלך - </span><strong>{balanceDueText}</strong>
            </div>
            <button className="withdrawal" onClick={onToggleWithdrawalRequest || undefined} disabled={isLoading || withdrawalSaving}>
                <span className="icon"><img src={withdrawalIcon} alt="" /></span> <span>{withdrawalText}</span>
            </button>
        </div>
        <div className="col">
            <div className="the_customers">
                <span>לקוחות שסגרו </span><strong>{closedCustomersText}</strong>
            </div>
            <div className="new_link_actions">
                <button className="copy_current_link" onClick={onCopyCurrentLink || undefined} disabled={copyCurrentLinkDisabled}>
                    <span>{copyCurrentLinkText}</span><img src={copyIcon} alt="" />
                </button>
                <button className="new_link_send" onClick={onGenerateNewLink || undefined} disabled={generateLinkSaving}>
                    <span>{generateLinkText}</span><img src={copyIcon} alt="" />
                </button>
            </div>
        </div>
    </div>
  );
};

export default BrokerInfo;
