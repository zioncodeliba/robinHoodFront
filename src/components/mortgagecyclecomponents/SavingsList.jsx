import React from "react";

const SavingsList = ({ data }) => {
  const savingsData = Array.isArray(data) && data.length > 0 ? data : [
    { id: 1, label: "חיסכון חודשי", value: "1,200 ש\"ח" },
    { id: 2, label: "חיסכון באחוזים", value: "23%" },
    { id: 3, label: "החזר חודשי צפוי", value: "9,350 ש\"ח" },
    { id: 4, label: "החזר לשקל:", value: "1.75" },
  ];

  return (
    <div className="savings_list">
      <ul className="d_flex d_flex_jb">
        {savingsData.map((item) => (
          <li key={item.id}>
            {item.label}
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavingsList;
