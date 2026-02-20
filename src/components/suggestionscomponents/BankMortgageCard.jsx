import React  from "react";

import mizrahitefahotbank from '../../assets/images/mfahot_bank.png';
import nationalbank from '../../assets/images/national_bank.png';


const BankMortgageCard = ({bankData}) => {
   
    const bankImage = bankData?.bankLogo;

    const formatMoney = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) {
            return '—';
        }
        return `₪${num.toLocaleString('he-IL')}`;
    };

    const renderStatusTag = () => {
        const status = bankData?.status;
        if (!status?.type) return null;
        if (status.type === 'final') {
            return (
                <div className="tag final_approval">
                    אישור סופי
                </div>
            );
        } else if (status.type === 'conditional') {
            return (
                <div className="tag conditional_approval">
                    אישור עקרוני  {status.time || ''}
                </div>
            );
        }
        return null;
    };
  return (
    <div className="bank_mortgage_card" style={{ '--color': bankData.color }}> 

        <div className="bank_icon"> 
            <img src={bankImage} alt={bankData.name} />
        </div>
        <h2>{bankData.name}</h2>
        {/* <div className="tag">אישור עקרוני - {bankData.approvalTime}</div> */}
        {renderStatusTag()}
        <ul className="d_flex">
            <li>
                <h3>סכום</h3>
                <p>{formatMoney(bankData.amount)}</p>
            </li>
            <li>
                <h3>תקופה בשנים</h3>
                <p>{bankData.years ?? '—'}</p>
            </li>
            <li>
                <h3>תשלום חודשי מקסימלי צפוי</h3>
                <p>{formatMoney(bankData.maxMonthlyPayment)}</p>
            </li>
            <li>
                <h3>תשלום חודשי ראשון</h3>
                <p>{formatMoney(bankData.firstMonthlyPayment)}</p>
            </li>
            <li>
                <h3>סך הכל תשלומים</h3>
                <p>{formatMoney(bankData.totalPayments)}</p>
            </li>
        </ul>
    </div>
  );
};

export default BankMortgageCard;
