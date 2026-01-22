import React  from "react";

import mizrahitefahotbank from '../../assets/images/mfahot_bank.png'
import nationalbank from '../../assets/images/national_bank.png'


const BankMortgageCard = ({bankData}) => {

    const bankImage = bankData.name_en === 'Mizrahi-Tefahot' ? mizrahitefahotbank : nationalbank;

    const renderStatusTag = () => {
        if (bankData.status.type === 'final') {
            return (
                <div className="tag final_approval">
                    אישור סופי
                </div>
            );
        } else if (bankData.status.type === 'conditional') {
            return (
                <div className="tag conditional_approval">
                    אישור עקרוני  {bankData.status.time}
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
                <p>₪{bankData.amount.toLocaleString()}</p>
            </li>
            <li>
                <h3>תקופה בשנים</h3>
                <p>{bankData.years}</p>
            </li>
            <li>
                <h3>תשלום חודשי מקסימלי צפוי</h3>
                <p>₪{bankData.maxMonthlyPayment.toLocaleString()}</p>
            </li>
            <li>
                <h3>תשלום חודשי ראשון</h3>
                <p>₪{bankData.firstMonthlyPayment.toLocaleString()}</p>
            </li>
            <li>
                <h3>סך הכל תשלומים</h3>
                <p>₪{bankData.totalPayments.toLocaleString()}</p>
            </li>
        </ul>
    </div>
  );
};

export default BankMortgageCard;