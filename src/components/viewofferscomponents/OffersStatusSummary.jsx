import React from "react";

const OffersStatusSummary = ({ banks = [], onSelectBank, bestBankId, bestBankName }) => {
  if (!banks.length) return null;

  return (
    <div className="bank_offer_list">
      {banks.map((bank) => (
        <ul
          key={bank.id}
          className={bank.id === bestBankId ? 'best_offer_row' : ''}
          onClick={() => onSelectBank?.(bank.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelectBank?.(bank.id);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <li
            className="bank_name_cell"
          >
            <span>{bank.bankLogo ? <img src={bank.bankLogo} alt="" /> : null}</span>
            <h4>{bank.bankName}</h4>
            {bank.id === bestBankId ? (
              <span className="best_offer_badge">ההצעה המשתלמת ביותר</span>
            ) : null}
          </li>
          <li>
            <a
              className="final_approval"
            >
              אישור עקרוני
            </a>
          </li>
        </ul>
      ))}
      <div className="most_offer">
        {bestBankName ? `ההצעה המשתלמת ביותר: ${bestBankName}` : 'ההצעה המשתלמת ביותר'}
      </div>
    </div>
  );
};

export default OffersStatusSummary;
