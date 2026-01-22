// BrokerHomepage.jsx
import React from "react";


const BrokerStatementList = () => {
  return (
    <div className="broker_statement_list">
        <div className="statement_had d_flex d_flex_ac d_flex_jb">
            <ul className="month_tab d_flex">
                <li className="active">חודש האחרון</li>
                <li>חודשיים אחרונים</li>
                <li>הכל</li>
            </ul>
            <ul className="show_link d_flex d_flex_ac">
                <li><a href="/" className="link">הצג הכל</a></li>
                <li><a href="/" className="link">הצג רק פעילים</a></li>
            </ul>
        </div>
        <div className="statement_inner d_flex">
            <div className="colin">
                <ul className="title">
                    <li>שם לקוח</li>
                    <li>סטטוס</li>
                    <li>שלב</li>
                </ul>
                <div className="wrap">
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status no_offer_received"><span>לא קיבל הצעות</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status not_registered"><span>לא נרשם</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status offer_accepted"><span>התקבלה הצעה</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status offer_accepted"><span>התקבלה הצעה</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status no_offer_received"><span>לא קיבל הצעות</span></li>
                    </ul>
                </div>
            </div>
            <div className="colin">
                <ul className="title">
                    <li>שם לקוח</li>
                    <li>סטטוס</li>
                    <li>שלב</li>
                </ul>
                <div className="wrap">
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status no_offer_received"><span>לא קיבל הצעות</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status not_registered"><span>לא נרשם</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status offer_accepted"><span>התקבלה הצעה</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status offer_accepted"><span>התקבלה הצעה</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status no_offer_received"><span>לא קיבל הצעות</span></li>
                    </ul>
                </div>
            </div>
            <div className="colin">
                <ul className="title">
                    <li>שם לקוח</li>
                    <li>סטטוס</li>
                    <li>שלב</li>
                </ul>
                <div className="wrap">
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status no_offer_received"><span>לא קיבל הצעות</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status not_registered"><span>לא נרשם</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status offer_accepted"><span>התקבלה הצעה</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status offer_accepted"><span>התקבלה הצעה</span></li>
                    </ul>
                    <ul className="details">
                        <li>איציק לוי</li>
                        <li>אישור עקרוני</li>
                        <li className="status no_offer_received"><span>לא קיבל הצעות</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BrokerStatementList;
