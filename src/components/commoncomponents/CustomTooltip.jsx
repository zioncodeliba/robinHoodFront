import React from 'react';
import './ReturnsChart.css'; 

export default function CustomTooltip({ active, payload, label, interestLegend, fundLegend }) {
  if (active && payload && payload.length) {
    
    // Find the 'keren' and 'rivit' data points
    const kerenData = payload.find(p => p.dataKey === 'keren');
    const rivitData = payload.find(p => p.dataKey === 'rivit');

    const kerenValue = kerenData ? kerenData.value.toLocaleString() : 'N/A';
    const rivitValue = rivitData ? rivitData.value.toLocaleString() : 'N/A';
    
    // Use the passed props for dynamic labels
    // const kerenLabel = fundLegend || 'קרן'; 
    // const rivitLabel = interestLegend || 'ריבית'; 

    return (
      <div className="custom-chart-tooltip" dir="rtl">
        <div className="custom-tooltip-box">
          
          {/* Rivit / Interest Line */}
          {rivitData && (
            <div className="tooltip-item rivit-line" style={{ color: rivitData.stroke }}>
              {/* <span className="tooltip-label">{rivitLabel}:</span> */}
              <span className="tooltip-value">{rivitValue} ש"ח</span>
            </div>
          )}
          
          {/* Keren / Fund Line */}
          {kerenData && (
            <div className="tooltip-item keren-line" style={{ color: kerenData.stroke }}>
              {/* <span className="tooltip-label">{kerenLabel}:</span> */}
              <span className="tooltip-value">{kerenValue} ש"ח</span>
            </div>
          )}
          
        </div>
      </div>
    );
  }
  return null;
}