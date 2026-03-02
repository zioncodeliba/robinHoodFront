import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const MONTH_FILTER_OPTIONS = [
  { value: "last_month", label: "חודש האחרון" },
  { value: "last_two_months", label: "חודשיים אחרונים" },
  { value: "all", label: "הכל" },
];

const COLUMN_COUNT = 3;

const parseDateValue = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const isInDateRange = (dateValue, monthFilter) => {
  if (!dateValue || monthFilter === "all") return true;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (monthFilter === "last_two_months") {
    start.setMonth(start.getMonth() - 2);
  } else {
    start.setMonth(start.getMonth() - 1);
  }

  return dateValue >= start;
};

const splitIntoColumns = (items, columnCount) => {
  if (!Array.isArray(items) || items.length === 0) return [[]];
  const perColumn = Math.ceil(items.length / columnCount);
  return Array.from({ length: columnCount }, (_, index) =>
    items.slice(index * perColumn, index * perColumn + perColumn)
  ).filter((column) => column.length > 0);
};

const BrokerStatementList = ({ items = [], loading = false, stepFilter = "all" }) => {
  const [monthFilter, setMonthFilter] = useState("last_month");
  const [showMode, setShowMode] = useState("all");

  const visibleItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];

    return safeItems
      .filter((item) => (stepFilter === "all" ? true : item?.stepClass === stepFilter))
      .filter((item) => (showMode === "active" ? item?.stepClass !== "not_registered" : true))
      .filter((item) => isInDateRange(parseDateValue(item?.createdAt), monthFilter))
      .sort((left, right) => {
        const leftDate = parseDateValue(left?.createdAt);
        const rightDate = parseDateValue(right?.createdAt);
        return (rightDate?.getTime() || 0) - (leftDate?.getTime() || 0);
      });
  }, [items, monthFilter, showMode, stepFilter]);

  const columns = useMemo(() => splitIntoColumns(visibleItems, COLUMN_COUNT), [visibleItems]);

  return (
    <div className="broker_statement_list">
      <div className="statement_had d_flex d_flex_ac d_flex_jb">
        <ul className="month_tab d_flex">
          {MONTH_FILTER_OPTIONS.map((option) => (
            <li
              key={option.value}
              className={monthFilter === option.value ? "active" : ""}
              onClick={() => setMonthFilter(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
        <ul className="show_link d_flex d_flex_ac">
          <li>
            <button
              type="button"
              className={`link ${showMode === "all" ? "active" : ""}`}
              onClick={() => setShowMode("all")}
            >
              הצג הכל
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`link ${showMode === "active" ? "active" : ""}`}
              onClick={() => setShowMode("active")}
            >
              הצג רק פעילים
            </button>
          </li>
        </ul>
      </div>

      <div className="statement_inner d_flex">
        {loading ? <p className="statement_state">טוען לקוחות...</p> : null}
        {!loading && visibleItems.length === 0 ? (
          <p className="statement_state">
            {stepFilter === "all" ? "עדיין אין לקוחות להצגה." : "אין לקוחות בשלב שנבחר."}
          </p>
        ) : null}
        {!loading &&
          visibleItems.length > 0 &&
          columns.map((columnItems, columnIndex) => (
            <div className="colin" key={`column-${columnIndex}`}>
              <ul className="title">
                <li>שם לקוח</li>
                <li>סטטוס</li>
                <li>שלב</li>
              </ul>
              <div className="wrap">
                {columnItems.map((item, itemIndex) => (
                  <ul className="details" key={item?.id || `item-${columnIndex}-${itemIndex}`}>
                    <li>{item?.customerName || "—"}</li>
                    <li>{item?.status || "—"}</li>
                    <li className={`status ${item?.stepClass || ""}`}>
                      {item?.stepRoute ? (
                        <Link to={item.stepRoute} className="step_link">
                          <span>{item?.step || "—"}</span>
                        </Link>
                      ) : (
                        <span>{item?.step || "—"}</span>
                      )}
                    </li>
                  </ul>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default BrokerStatementList;
