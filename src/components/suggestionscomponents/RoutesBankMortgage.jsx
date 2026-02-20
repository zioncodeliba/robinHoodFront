import React, { useEffect, useState } from "react";

const RoutesBankMortgage = ({
  color,
  routes,
  maxVisibleRoutes = Number.POSITIVE_INFINITY,
  expandLabel = "לצפיה בכל המסלולים",
  collapseLabel = "הסתר מסלולים",
}) => {
  const safeRoutes = Array.isArray(routes) ? routes : [];
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [routes, maxVisibleRoutes]);

  const normalizedMaxVisible = Number.isFinite(maxVisibleRoutes) && maxVisibleRoutes > 0
    ? Math.floor(maxVisibleRoutes)
    : Number.POSITIVE_INFINITY;
  const hasToggle = safeRoutes.length > normalizedMaxVisible;
  const visibleRoutes = hasToggle && !isExpanded
    ? safeRoutes.slice(0, normalizedMaxVisible)
    : safeRoutes;

  const formatAmount = (amountValue, balanceValue) => {
    if (balanceValue) return balanceValue;
    const amount = Number(amountValue);
    if (!Number.isFinite(amount)) return '—';
    return `${amount.toLocaleString('he-IL')} ש"ח`;
  };

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

  return (
    <div className="routes_bank_mortgage" style={{ '--color': color }}>
      <ul className="title_routes d_flex d_flex_ac">
        <li>מסלולים</li>
        <li>חודשים</li>
        <li>ריבית</li>
        <li>יתרה</li>
      </ul>

      <div className="list_routes">
        {visibleRoutes.map((item, index) => {
          const months = getMonthsValue(item);
          return (
            <ul key={`${item.name || item.label || 'route'}-${index}`}>
              <li>
                <span>
                  <span className="route_name">{item.name || item.label || 'מסלול'}</span>
                </span>
              </li>
              <li>{months ? `${months}` : '—'}</li>
              <li>{item.interest || '—'}</li>
              <li>{formatAmount(item.amount, item.balance)}</li>
            </ul>
          );
        })}
      </div>
      {hasToggle && (
        <div className="routes_toggle_wrap">
          <button
            type="button"
            className="routes_toggle_btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? collapseLabel : expandLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default RoutesBankMortgage;
