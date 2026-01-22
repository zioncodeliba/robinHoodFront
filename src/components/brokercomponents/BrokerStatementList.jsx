// BrokerStatementList.jsx - UPDATED
import React, { useState } from "react";

// The component now expects an object where keys are the column identifiers
const BrokerStatementList = ({ data }) => {
  const [activeTab, setActiveTab] = useState('last_month');
  
  // 💡 Get an array of keys (colin1, colin2, colin3) to map over
  const columnKeys = Object.keys(data);

  // 💡 Function to render a single list item
  const renderStatementItem = (item, index) => (
    <ul className="details" key={index}>
      <li>{item.customerName}</li>
      <li>{item.status}</li>
      <li className={`status ${item.stepClass}`}>
        <span>{item.step}</span>
      </li>
    </ul>
  );

  return (
    <div className="broker_statement_list">
      <div className="statement_had d_flex d_flex_ac d_flex_jb">
        {/* Tab Logic - set 'active' class based on state and update state on click */}
        <ul className="month_tab d_flex">
          <li
            className={activeTab === 'last_month' ? 'active' : ''}
            onClick={() => setActiveTab('last_month')}
          >
            חודש האחרון
          </li>
          <li
            className={activeTab === 'last_two_months' ? 'active' : ''}
            onClick={() => setActiveTab('last_two_months')}
          >
            חודשיים אחרונים
          </li>
          <li
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            הכל
          </li>
        </ul>
        <ul className="show_link d_flex d_flex_ac">
          <li><a href="/" className="link">הצג הכל</a></li>
          <li><a href="/" className="link">הצג רק פעילים</a></li>
        </ul>
      </div>

      <div className="statement_inner d_flex">
        {/* 💡 Map over the columnKeys array (colin1, colin2, colin3) */}
        {columnKeys.map((colKey) => (
          <div className="colin" key={colKey}>
            <ul className="title">
              <li>שם לקוח</li>
              <li>סטטוס</li>
              <li>שלב</li>
            </ul>
            <div className="wrap">
              {/* 💡 Use the array corresponding to the current key (e.g., data.colin1) */}
              {data[colKey].map(renderStatementItem)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrokerStatementList;