import React  from "react";

const RoutesBankMortgage = ({color ,routes }) => {

   
  return (
    <div className="routes_bank_mortgage" style={{ '--color':color }}> 
        {routes.map((item, index) => (
            <ul key={index}>
            <li><span>{item.label}</span></li>
            <li>
                {item.amount.toLocaleString()} ש"ח ({item.percent}%)
            </li>
            </ul>
        ))}
    </div>
  );
};

export default RoutesBankMortgage;