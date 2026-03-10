import React, { useEffect, useMemo, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, TooltipComponent } from "echarts/components";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import './ReturnsChart.css';

import CustomTooltip from "./CustomTooltip";

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

const MONTHS_IN_YEAR = 12;

export default function ReturnsChart({
    charttitle,
    interest,
    fund,
    indexation,
    dataSets,
    variant = "line",
    kerenColor = "#27450E",
    rivitColor = "#E4061F",
    hatzmadaColor = "#A6B88E",
}) {
    const [selectedYear, setSelectedYear] = useState(null);

    const availableYears = useMemo(() => {
        if (!dataSets || Array.isArray(dataSets) || typeof dataSets !== "object") {
            return [];
        }

        return Object.keys(dataSets)
            .filter((key) => Array.isArray(dataSets[key]))
            .sort((a, b) => Number(a) - Number(b));
    }, [dataSets]);

    useEffect(() => {
        if (!availableYears.length) {
            setSelectedYear(null);
            return;
        }

        setSelectedYear((current) => (
            current && availableYears.includes(String(current))
                ? String(current)
                : availableYears[0]
        ));
    }, [availableYears]);

    const lineData = useMemo(() => {
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

    const stackedBarData = useMemo(() => {
        if (!dataSets) return [];

        if (Array.isArray(dataSets)) {
            return dataSets.map((point, index) => ({
                name: point?.name || `שנה ${index + 1}`,
                keren: Number(point?.keren) || 0,
                hatzmada: Number(point?.hatzmada) || 0,
                rivit: Number(point?.rivit) || 0,
            }));
        }

        if (typeof dataSets !== "object") {
            return [];
        }

        if (!availableYears.length) {
            return [];
        }

        const activeYear = selectedYear && availableYears.includes(String(selectedYear))
            ? String(selectedYear)
            : availableYears[0];
        const yearData = Array.isArray(dataSets[activeYear]) ? dataSets[activeYear] : [];
        const yearDataByMonth = new Map(
            yearData.map((point, index) => [
                Number(point?.name) || index + 1,
                point,
            ])
        );

        return Array.from({ length: MONTHS_IN_YEAR }, (_, index) => {
            const monthNumber = index + 1;
            const point = yearDataByMonth.get(monthNumber) || null;
            return {
                name: String(monthNumber),
                keren: Number(point?.keren) || 0,
                hatzmada: Number(point?.hatzmada) || 0,
                rivit: Number(point?.rivit) || 0,
            };
        });
    }, [availableYears, dataSets, selectedYear]);

    const hasIndexationSeries = useMemo(
        () => Boolean(indexation) || stackedBarData.some((point) => point.hatzmada),
        [indexation, stackedBarData]
    );

    const stackedBarOption = useMemo(() => ({
        animationDuration: 450,
        grid: {
            left: 18,
            right: 18,
            top: 12,
            bottom: 12,
            containLabel: true,
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
                shadowStyle: {
                    color: "rgba(15, 139, 255, 0.08)",
                },
            },
            backgroundColor: "#FFFFFF",
            borderColor: "#D9E8D8",
            borderWidth: 1,
            textStyle: {
                color: "#27450E",
                fontFamily: "inherit",
            },
            formatter: (params) => {
                const rows = Array.isArray(params) ? params : [];
                const title = rows[0]?.axisValueLabel || "";
                const items = rows
                    .map((item) => {
                        const value = Number(item?.value) || 0;
                        return `${item.marker} ${item.seriesName}: ${value.toLocaleString("he-IL")}`;
                    })
                    .join("<br/>");
                return `${title}<br/>${items}`;
            },
        },
        xAxis: {
            type: "category",
            data: stackedBarData.map((point) => point.name),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
        },
        yAxis: {
            type: "value",
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
                color: "#27450E",
                fontSize: 12,
                formatter: (value) => Number(value).toLocaleString("he-IL"),
            },
        },
        series: [
            {
                name: fund,
                type: "bar",
                stack: "payments",
                barWidth: 18,
                itemStyle: { color: kerenColor },
                emphasis: {
                    itemStyle: {
                        borderColor: "#0F8BFF",
                        borderWidth: 3,
                    },
                },
                data: stackedBarData.map((point) => point.keren),
            },
            ...(hasIndexationSeries ? [{
                name: indexation,
                type: "bar",
                stack: "payments",
                barWidth: 18,
                itemStyle: { color: hatzmadaColor },
                emphasis: {
                    itemStyle: {
                        borderColor: "#0F8BFF",
                        borderWidth: 3,
                    },
                },
                data: stackedBarData.map((point) => point.hatzmada),
            }] : []),
            {
                name: interest,
                type: "bar",
                stack: "payments",
                barWidth: 18,
                itemStyle: {
                    color: rivitColor,
                    borderRadius: [6, 6, 0, 0],
                },
                emphasis: {
                    itemStyle: {
                        borderColor: "#0F8BFF",
                        borderWidth: 3,
                    },
                },
                data: stackedBarData.map((point) => point.rivit),
            },
        ],
    }), [fund, hasIndexationSeries, hatzmadaColor, indexation, interest, kerenColor, rivitColor, stackedBarData]);

    if (variant === "stacked-bars") {
        return (
            <div className="chart_sec chart_sec--stacked">
                <div className="chart_inner chart_inner--stacked">
                    {availableYears.length > 0 ? (
                        <div className="chart_tab chart_tab--stacked">
                            {availableYears.map((yearKey) => (
                                <button
                                    key={yearKey}
                                    type="button"
                                    onClick={() => setSelectedYear(yearKey)}
                                    className={selectedYear === yearKey ? "active" : ""}
                                >
                                    {`שנה ${yearKey}`}
                                </button>
                            ))}
                        </div>
                    ) : null}
                    <div className="chart_header">
                        <h3 className="chart_title">{charttitle}</h3>
                    </div>
                    <div dir="rtl" className="chart-container chart-container--stacked">
                        <ReactEChartsCore
                            echarts={echarts}
                            option={stackedBarOption}
                            notMerge
                            lazyUpdate
                            opts={{ renderer: "canvas" }}
                            style={{ height: "100%", width: "100%" }}
                        />
                    </div>
                    <div className="chart_footer_legend">
                        <div className="chart_footer_legend_item">
                            <span className="dot dot--interest" style={{ backgroundColor: rivitColor }}></span>
                            <span>{interest}</span>
                        </div>
                        {hasIndexationSeries ? (
                            <div className="chart_footer_legend_item">
                                <span className="dot dot--indexation" style={{ backgroundColor: hatzmadaColor }}></span>
                                <span>{indexation}</span>
                            </div>
                        ) : null}
                        <div className="chart_footer_legend_item">
                            <span className="dot dot--fund" style={{ backgroundColor: kerenColor }}></span>
                            <span>{fund}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chart_sec">
            <div className="chart_legend d_flex d_flex_ac d_flex_js">
                <div className="interest d_flex d_flex_ac"><span></span> {interest} </div>
                <div className="fund d_flex d_flex_ac"><span></span> {fund} </div>
            </div>
            <div className="chart_inner">
                <h3 className="chart_title">{charttitle}</h3>
                <div dir="rtl" className="chart-container">
                    <ResponsiveContainer width="100%" height="100%" >
                        <RechartsLineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
