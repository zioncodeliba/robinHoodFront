import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import './ReturnsChart.css';

import CustomTooltip from "../commoncomponents/CustomTooltip";

const dataSets = {
  1: [
    { name: "ינואר",  rivit: 2000, keren: 2000 },
    { name: "פברואר", rivit: 3000, keren: 3200 },
    { name: "מרץ",    rivit: 3200, keren: 3600 },
    { name: "אפריל",  rivit: 3100, keren: 4650 },
    { name: "מאי",    rivit: 3300, keren: 4200 },
    { name: "יוני",   rivit: 3500, keren: 4400 },
    { name: "יולי",   rivit: 3400, keren: 4100 },
  ],
  2: [
    { name: "ינואר",  rivit: 2200, keren: 6000 },
    { name: "פברואר", rivit: 3000, keren: 5000 },
    { name: "מרץ",    rivit: 3200, keren: 4000 },
    { name: "אפריל",  rivit: 3100, keren: 3000 },
    { name: "מאי",    rivit: 3300, keren: 3500 },
    { name: "יוני",   rivit: 3500, keren: 3000 },
    { name: "יולי",   rivit: 3400, keren: 3100 },
  ],
  3: [
    { name: "ינואר",  rivit: 6000, keren: 2000 },
    { name: "פברואר", rivit: 5000, keren: 3200 },
    { name: "מרץ",    rivit: 4000, keren: 3600 },
    { name: "אפריל",  rivit: 3000, keren: 4650 },
    { name: "מאי",    rivit: 3500, keren: 4200 },
    { name: "יוני",   rivit: 3000, keren: 4400 },
    { name: "יולי",   rivit: 3100, keren: 4100 },
  ]
};

export default function ReturnsChart({charttitle ,interest ,fund}) {
  const [selected, setSelected] = useState(1);

  return (
    <div className="chart_sec">
    {/* Legend */}
    <div className="chart_legend d_flex d_flex_ac d_flex_js">
      <div className="interest d_flex d_flex_ac"><span></span> {interest} </div>          
      <div className="fund d_flex d_flex_ac"><span></span> {fund} </div>
    </div>
    <div className="chart_inner">
      {/* Tabs */}
      <div className="chart_tab d_flex d_flex_ac d_flex_js">
        {[1, 2, 3, 4, 5, 6].map((y) => (
          <button
            key={y}
            onClick={() => setSelected(y)}
            className={ selected === y ? "active" : "" } >
            {`שנה ${y}`}
          </button>
        ))}
      </div>

      {/* Chart Title */}
      <h3 className="chart_title">{charttitle}</h3>

      {/* Chart */}
      <div dir="rtl" className="chart-container">
        <ResponsiveContainer width="100%" height="100%" >
          <LineChart data={dataSets[selected]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false}  vertical={true} stroke="#D9DDE3" />
            <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false} 
            tick={{ fill: "#8D9196", fontSize: 12 }} />
            <YAxis 
             
             axisLine={false}    
            tickLine={false}
            tick={{ fill: "#373A3D", fontSize: 12 }} />
            {/* <Tooltip
                formatter={(value) => `${value.toLocaleString()} ש"ח`}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  direction: "rtl",
                  fontSize: "13px",
                }}
              /> */}
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#27450E", strokeWidth: 1, strokeDasharray: "4 4" }}
                isAnimationActive={false}
                />
            <Line
              type="monotone"
              dataKey="keren"
              stroke="#27450E"
              strokeWidth={2}
              //dot={{ r: 5 }}
              //activeDot={{ r: 1 }}
              //dot={{ r: 4, fill: "#fff", stroke: "#27450E", strokeWidth: 2 }}
               dot={false}
                activeDot={{
                    r: 6,
                    fill: "#fff",
                    stroke: "#27450E",
                    strokeWidth: 3,
                }}
            />
            <Line
              type="monotone"
              dataKey="rivit"
              stroke="#E4061F"
              strokeWidth={2}
                dot={false}
                activeDot={{
                    r: 6,
                    fill: "#fff",
                    stroke: "#E4061F",
                    strokeWidth: 3,
                }}
            />
           
          </LineChart>
        </ResponsiveContainer>
      </div>
     
    </div>
    </div>
    
  );
}
