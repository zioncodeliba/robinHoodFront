import React, { useMemo } from "react";
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
    const data = useMemo(() => {
        if (Array.isArray(dataSets)) {
            return dataSets;
        }
        if (!dataSets || typeof dataSets !== 'object') {
            return [];
        }

        const sortedKeys = Object.keys(dataSets).sort((a, b) => {
            const aNum = Number(a);
            const bNum = Number(b);
            if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
                return aNum - bNum;
            }
            return a.localeCompare(b);
        });

        const merged = [];
        sortedKeys.forEach((key) => {
            const yearData = Array.isArray(dataSets[key]) ? dataSets[key] : [];
            yearData.forEach((point) => {
                merged.push(point);
            });
        });

        return merged.map((point, index) => ({
            ...point,
            name: String(index + 1),
        }));
    }, [dataSets]);

    return (
        <div className="chart_sec">
            {/* Legend */}
            <div className="chart_legend d_flex d_flex_ac d_flex_js">
                <div className="interest d_flex d_flex_ac"><span></span> {interest} </div>
                <div className="fund d_flex d_flex_ac"><span></span> {fund} </div>
            </div>
            <div className="chart_inner">

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
