import React, { useState } from "react";
import './RoutesExplanation.css';
import notificationicon from '../../assets/images/notification_i.svg';
import closePopupImg from '../../assets/images/close_popup.png';

const getMonthsValue = (route) => {
  const months = Number(
    route?.months ??
    route?.termMonths ??
    route?.durationMonths ??
    route?.["תקופה_חודשים"] ??
    route?.["תקופה (חודשים)"]
  );
  if (!Number.isFinite(months) || months <= 0) return null;
  return Math.round(months);
};

const formatAmount = (amountValue, balanceValue) => {
  if (balanceValue) return balanceValue;
  const amount = Number(amountValue);
  if (!Number.isFinite(amount)) return '—';
  return `${amount.toLocaleString('he-IL')} ₪`;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const RoutesExplanation = ({ routes, color = "#E4061F", totalPayments }) => {
  const [notePopupOpen, setNotePopupOpen] = useState(false);
  const fallbackRoutes = [
    { name: 'ק"צ', percentage: "40%", months: 108, interest: "5%", balance: "640,000 ₪" },
    { name: 'מ"צ', percentage: "40%", months: 108, interest: "5%", balance: "368,000 ₪" },
    { name: "פריים", percentage: "40%", months: 108, interest: "5%", balance: "592,000 ₪" },
  ];
  const safeRoutes = Array.isArray(routes) && routes.length > 0 ? routes : fallbackRoutes;
  const totalAmount = safeRoutes.reduce((sum, route) => {
    const amount = Number(route?.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
  const summaryTotal = toNumber(totalPayments);
  const displayTotal = Number.isFinite(summaryTotal) && summaryTotal > 0
    ? summaryTotal
    : totalAmount;

  return (
    <div className="routes_explanation" style={{ "--routes-color": color }}>
        <h2>התמהיל שלך</h2>
        <div
          className="note d_flex d_flex_ac d_flex_jc"
          role="button"
          tabIndex={0}
          onClick={() => setNotePopupOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setNotePopupOpen(true)}
        >
          <img src={notificationicon} alt="" />
          <span>הסבר על המסלולים</span>
        </div>

        {notePopupOpen && (
          <div className="note_popup note_popup open">
            <span className="close" onClick={() => setNotePopupOpen(false)}>
              <img src={closePopupImg} alt="" />
            </span>
            <div className="inner">
              <div className="col">
                <h2>קבועה לא צמודה ( קל&quot;צ)</h2>
                <p>ריבית קבועה, ללא הצמדה למדד. החזר חודשי יציב וידוע מראש.</p>
              </div>
              <div className="col">
                <h2>קבועה צמודה (ק&quot;צ)</h2>
                <p>ריבית קבועה, צמודה למדד. ריבית התחלתית נמוכה יותר,עם סיכון לעלייה בהחזר החודשי.</p>
              </div>
              <div className="col">
                <h2>משתנה לא צמודה (מל&quot;צ)</h2>
                <p>ריבית מתעדכנת כל תקופת זמן מוגדרת,ללא הצמדה למדד. שילוב של גמישות ויציבות.</p>
              </div>
              <div className="col">
                <h2>משתנה צמודה (מ&quot;צ)</h2>
                <p>ריבית מתעדכנת כל תקופת זמן מוגדרת,צמודה למדד, עם סיכון לעלייה בהחזר החודשי.</p>
              </div>
              <div className="col">
                <h2>פריים</h2>
                <p>ריבית משתנה לפי בנק ישראל. מסלול גמיש עם אפשרות לשינויים בהחזר.</p>
              </div>
            </div>
          </div>
        )}
        <ul className="title_routes d_flex d_flex_ac">
          <li>מסלולים</li>
          <li>מס׳ חודשים</li>
          <li>ריבית</li>
          <li>יתרה</li>
        </ul>
        <div className="list_routes">
          {safeRoutes.map((route, index) => {
            const months = getMonthsValue(route);
            const routeName = route?.name || route?.label || "מסלול";
            const routePercent = route?.percentage || null;
            return (
              <ul key={`${routeName}-${index}`}>
                <li>
                  <span>
                    {routePercent ? <em>({routePercent})</em> : null}
                    {` ${routeName}`}
                  </span>
                </li>
                <li>{months ? `${months}` : "—"}</li>
                <li>{route?.interest || "—"}</li>
                <li>{formatAmount(route?.amount, route?.balance)}</li>
              </ul>
            );
          })}
          <div className="total">
            {displayTotal > 0
              ? `סה"כ: ${displayTotal.toLocaleString('he-IL')} ש"ח`
              : 'סה"כ: —'}
          </div>
        </div>
    </div>
  );
};

export default RoutesExplanation;
