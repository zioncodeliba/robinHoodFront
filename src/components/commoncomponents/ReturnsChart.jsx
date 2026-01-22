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

import CustomTooltip from "./CustomTooltip";

// dataSets is now accepted as a prop

export default function ReturnsChart({ charttitle, interest, fund, dataSets ,
    kerenColor = "#27450E",
    rivitColor = "#E4061F"
 }) {
    // Check if the data is structured as an object with keys (like the one with tabs)
    const isTabbedData = dataSets && typeof dataSets === 'object' && !Array.isArray(dataSets);
    
    // Get the keys for the tabs, defaulting to [1, 2, 3, 4, 5, 6] if not available
    const tabKeys = isTabbedData ? Object.keys(dataSets) : [1, 2, 3, 4, 5, 6];

    // Initialize state with the first available key or '1'
    const [selected, setSelected] = useState(tabKeys[0] || 1);

    // Determine the data to display
    const data = isTabbedData ? dataSets[selected] : dataSets;

    return (
        <div className="chart_sec">
            {/* Legend */}
            <div className="chart_legend d_flex d_flex_ac d_flex_js">
                <div className="interest d_flex d_flex_ac"><span></span> {interest} </div>
                <div className="fund d_flex d_flex_ac"><span></span> {fund} </div>
            </div>
            <div className="chart_inner">
                
                {/* Tabs - only render if data is structured for tabs */}
                {isTabbedData && (
                    <div className="chart_tab d_flex d_flex_ac d_flex_js">
                        {tabKeys.map((key) => (
                            <button
                                key={key}
                                onClick={() => setSelected(key)}
                                className={selected === key ? "active" : ""} >
                                {`שנה ${key}`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Chart Title */}
                <h3 className="chart_title">{charttitle}</h3>

                {/* Chart */}
                <div dir="rtl" className="chart-container">
                    <ResponsiveContainer width="100%" height="100%" >
                        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#D9DDE3" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#8D9196", fontSize: 12 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#373A3D", fontSize: 12 }} />
                            
                            {/* Pass the dynamic legends to CustomTooltip */}
                            <Tooltip
                                content={<CustomTooltip interestLegend={interest} fundLegend={fund} />}
                                cursor={{ stroke: "#27450E", strokeWidth: 1, strokeDasharray: "4 4" }}
                                isAnimationActive={false}
                            />
                            
                            <Line
                                type="monotone"
                                dataKey="keren" 
                                stroke={kerenColor}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: "#fff", stroke: kerenColor, strokeWidth: 3 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="rivit" 
                                stroke={rivitColor}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: "#fff", stroke:rivitColor, strokeWidth: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}