import React, { useCallback } from 'react';
import arrow from '../../assets/images/range_arrow.png';

const formatNumber = (num) => {
  return new Intl.NumberFormat('he-IL').format(num);

};


const CustomRangeInput = ({ value, min, max, step, unit, onChange }) => {
  
  const getBubblePosition = useCallback((currentValue) => {
    const percentage = ((currentValue - min) / (max - min)) * 100;
    return percentage;
  }, [min, max]);

  const bubblePosition = getBubblePosition(value);

  // משתנה CSS כדי לצבוע את חלק ה-track לפני ה-thumb
  const inputStyle = {
    '--track-fill-percentage': `${bubblePosition}%`,
  };

  return (
    <div className="range_box"> 
        <div className="range_wrap">
          <div 
            className="tooltip"
            style={{ right: `${bubblePosition}%`, top: '-48px' }}
          >
            {formatNumber(value)} {unit}
            <div className="arrow"><img src={arrow} alt="" /></div>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            style={inputStyle}
            className="custom-range-slider "
          />
        </div>
        <div className="minmax_text " dir="rtl">
          <span className="text-left">{formatNumber(min)} {unit}</span>
          <span className="text-right">{formatNumber(max)} {unit}</span>
        </div>
    </div>
  );
};


export default CustomRangeInput;
