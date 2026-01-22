import React, { useState } from 'react';

const basketsData = [
  {
    id: 1,
    title: "סל אחיד 1",
    values: {
      amount: "500,000 ש”ח",
      maxMonthly: "6,670 ש”ח",
      firstPayment: "7,670 ש”ח",
      period: "30",
      totalPayments: "1,450,670 ש”ח",
      interest: "% 5.33 "
    }
  },
  {
    id: 2,
    title: "סל אחיד 2",
    values: {
      amount: "600,000 ש”ח",
      maxMonthly: "7,100 ש”ח",
      firstPayment: "8,150 ש”ח",
      period: "25",
      totalPayments: "1,350,200 ש”ח",
      interest: "% 4.90 "
    }
  },
  {
    id: 3,
    title: "סל אחיד 3",
    values: {
      amount: "720,000 ש”ח",
      maxMonthly: "8,900 ש”ח",
      firstPayment: "9,400 ש”ח",
      period: "20",
      totalPayments: "1,200,000 ש”ח",
      interest: "% 4.40 "
    }
  }
];

const UniformBasket = () => {
  const [activeTab, setActiveTab] = useState(0);

  const active = basketsData[activeTab];

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
      <div className="tab_wrap">
        <ul className='d_flex'>
          <li><span>סכום</span><span>{active.values.amount}</span></li>
          <li><span>תשלום חודשי מקסימלי צפוי</span><span>{active.values.maxMonthly}</span></li>
          <li><span>סך חודשי ראשון</span><span>{active.values.firstPayment}</span></li>
          <li><span>תקופה</span><span>{active.values.period}</span></li>
          <li><span>סך הכל תשלומים</span><span>{active.values.totalPayments}</span></li>
          <li><span>ריבית כוללת חזויה</span><span>{active.values.interest}</span></li>
        </ul>
      </div>

    </div>
  );
};

export default UniformBasket;
