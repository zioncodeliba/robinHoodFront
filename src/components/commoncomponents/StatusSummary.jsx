import React, { useState } from "react";
import './StatusSummary.css';
// import oarrow from '../../assets/images/o_arrow.png';
import oarrow from '../../assets/images/o_arrow.svg';

const StatusSummary = ({ statusData }) => {

  const { title, offertext, list } = statusData; 
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`status_summary_sec ${isOpen ? "open" : "closed"}`}>
      <div
        className="title d_flex d_flex_ac d_flex_jb"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        <h3>{title}</h3>
        <img
          src={oarrow}
          alt=""
          className={isOpen ? "status_arrow_open" : "status_arrow_closed"}
        />
      </div>

      <div className={`inner_list ${isOpen ? "open" : "closed"}`}>

        {list.map((item, index) => (
          <ul key={index}>
            <li>
              {item.link ? (
                <a className="status_summary_bank" href={item.link}>
                  <span>
                    {item.bankLogo ? (
                      <img src={item.bankLogo} alt={item.bankName} />
                    ) : null}
                  </span>
                  <h4>{item.bankName}</h4>
                </a>
              ) : (
                <>
                  <span>
                    {item.bankLogo ? (
                      <img src={item.bankLogo} alt={item.bankName} />
                    ) : null}
                  </span>
                  <h4>{item.bankName}</h4>
                </>
              )}
            </li>

            {/* Status Button */}
            <li>
              <a href={item.link} className={item.statusClass}>
                {item.statusText}
              </a>
            </li>
          </ul>
        ))}
        <div className="most_offer">
          {offertext}
        </div>
      </div>
    </div>
  );
};

export default StatusSummary;
