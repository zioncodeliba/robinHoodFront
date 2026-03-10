import React, { useEffect, useMemo, useState } from 'react';
import { getUniformBasketDisplayTitle, getUniformBasketOrder } from '../../utils/uniformBaskets';

const formatMoney = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  const formatted = Number(value).toLocaleString('he-IL', { maximumFractionDigits: 0 });
  return `${formatted} ₪`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `% ${Number(value).toLocaleString('he-IL', { maximumFractionDigits: 2 })}`;
};

const getMaxMonthly = (basket) => {
  const principal = basket?.graph_data?.principal_repayment || [];
  const interest = basket?.graph_data?.interest_payment || [];
  const indexation = basket?.graph_data?.indexation_component || [];
  const length = Math.max(principal.length, interest.length, indexation.length);
  let max = 0;
  for (let i = 0; i < length; i += 1) {
    const sum = (principal[i] || 0) + (interest[i] || 0) + (indexation[i] || 0);
    if (sum > max) max = sum;
  }
  return max || null;
};

const getWeightedAverageRate = (tracks = []) => {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;
  let sumRateAmount = 0;
  let sumAmount = 0;
  let sumRate = 0;
  let count = 0;
  tracks.forEach((track) => {
    const rate = Number(track?.Interest);
    const amount = Number(track?.Amount);
    if (!Number.isNaN(rate)) {
      sumRate += rate;
      count += 1;
      if (!Number.isNaN(amount) && amount > 0) {
        sumRateAmount += rate * amount;
        sumAmount += amount;
      }
    }
  });
  if (sumAmount > 0) {
    return sumRateAmount / sumAmount;
  }
  if (count > 0) {
    return sumRate / count;
  }
  return null;
};

const UniformBasket = ({ baskets, periodYears, onActiveChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  const basketsData = useMemo(() => {
    if (!baskets || typeof baskets !== 'object') return [];
    return Object.entries(baskets)
      .map(([rawTitle, data], index) => ({ rawTitle, data, index }))
      .sort((a, b) => getUniformBasketOrder(a.rawTitle, a.index) - getUniformBasketOrder(b.rawTitle, b.index))
      .map(({ rawTitle, data }, index) => {
        const summary = data?.summary || {};
        const rate = getWeightedAverageRate(data?.tracks_detail);
        return {
          id: index + 1,
          rawTitle,
          title: getUniformBasketDisplayTitle(rawTitle),
          raw: data,
          values: {
            amount: formatMoney(summary?.Loan_Amount),
            maxMonthly: formatMoney(getMaxMonthly(data)),
            firstPayment: formatMoney(summary?.First_Monthly_Payment),
            period: periodYears ? `${periodYears}` : '-',
            totalPayments: formatMoney(summary?.Total_Estimated_Repayment),
            interest: formatPercent(rate),
          },
        };
      });
  }, [baskets, periodYears]);

  const active = basketsData[activeTab];
  useEffect(() => {
    if (basketsData.length === 0) {
      if (typeof onActiveChange === 'function') {
        onActiveChange(null);
      }
      return;
    }
    if (activeTab >= basketsData.length) {
      setActiveTab(0);
      return;
    }
    if (typeof onActiveChange === 'function') {
      onActiveChange(basketsData[activeTab] || null);
    }
  }, [activeTab, basketsData, onActiveChange]);

  return (
    <div className='uniform_basket_sec'>
      
      {/* Tabs */}
      <ul className='tab d_flex'>
        {basketsData.map((item, index) => (
          <li
            key={item.id}
            className={index === activeTab ? "active" : ""}
            onClick={() => setActiveTab(index)}
          >
            {item.title}
          </li>
        ))}
      </ul>

      {/* Content */}
      {active ? (
        <div className="tab_wrap">
          <ul className='d_flex'>
            <li><span>סכום</span><span>{active.values.amount}</span></li>
            <li><span>תקופה</span><span>{active.values.period}</span></li>
            <li><span>תשלום חודשי מקסימלי</span><span>{active.values.maxMonthly}</span></li>
            <li><span>סך הכל תשלומים</span><span>{active.values.totalPayments}</span></li>
            <li><span>סך חודשי ראשון</span><span>{active.values.firstPayment}</span></li>
            <li><span>ריבית כוללת חזויה</span><span>{active.values.interest}</span></li>
          </ul>
        </div>
      ) : (
        <div className="tab_wrap">
          <p>הזן נתונים ולחץ על "חשב" להצגת סלים אחידים.</p>
        </div>
      )}

    </div>
  );
};

export default UniformBasket;
