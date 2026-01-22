import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// --- Mock Data ---
const data = [
  { year: 2000, value: 8500 },
  { year: 2001, value: 7800 },
  { year: 2002, value: 9100 },
  { year: 2003, value: 8900 },
  { year: 2004, value: 9500 },
  { year: 2005, value: 9200 },
  { year: 2006, value: 8300 },
  { year: 2007, value: 8700 },
  { year: 2008, value: 9300 },
  { year: 2009, value: 9600 },
  { year: 2010, value: 9700 },
  { year: 2011, value: 9550 },
  { year: 2012, value: 9250 },
  { year: 2013, value: 9650 },
  { year: 2014, value: 8550 },
  { year: 2015, value: 9050 },
  { year: 2016, value: 9400 },
  { year: 2017, value: 8100 },
  { year: 2018, value: 8500 },
  { year: 2019, value: 9350 },
  { year: 2020, value: 8200 },
  { year: 2021, value: 9150 },
];


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    // Format value with thousands separators
    const formattedValue = new Intl.NumberFormat('en-US').format(dataPoint.value);

    return (
      <div className="custom_tooltip">       
          {/* Label is the year */}
          {/* <p className="tooltip-year-label">
            שנה: {dataPoint.year}
          </p> */}
          {/* Value is the main data point */}
            חיסכון שנתי
            <br />
            {formattedValue} שח
      </div>
    );
  }

  return null;
};

const BarChartsavings = () => {
  return (
    <>

      {/* We wrap the chart in a div with defined height/width to control sizing within your layout */}
      <div className='barchart_box' >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            {/* Define the gradient for the bar color */}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#27450E" stopOpacity={1} />                
                <stop offset="100%" stopColor="#ffffff" stopOpacity={1} />
              </linearGradient>
            </defs>

            <XAxis dataKey="year" hide />
            {/* Domain adjusted to ensure bars don't touch the top/bottom */}
            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} /> 
            
            {/* Recharts Tooltip with custom content */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            
            {/* The main bar element, using the gradient fill and rounded corners */}
            <Bar 
              dataKey="value" 
              fill="url(#colorGradient)" 
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default BarChartsavings;