import React, { useCallback, useRef } from 'react';
import arrow from '../../assets/images/range_arrow.png';

const formatNumber = (num) => {
  return new Intl.NumberFormat('he-IL').format(num);

};


const CustomRangeInput = ({ value, min, max, step, unit, onChange, disabled = false }) => {
  const inputRef = useRef(null);
  const isThumbDraggingRef = useRef(false);
  
  const getBubblePosition = useCallback((currentValue) => {
    const percentage = ((currentValue - min) / (max - min)) * 100;
    return percentage;
  }, [min, max]);

  const bubblePosition = getBubblePosition(value);
  const bubbleRightOffset = 100 - bubblePosition;

  // משתנה CSS כדי לצבוע את חלק ה-track לפני ה-thumb
  const inputStyle = {
    '--track-fill-percentage': `${bubblePosition}%`,
    direction: 'ltr',
  };

  const emitValueChange = useCallback((nextValue) => {
    if (typeof onChange !== 'function') return;
    onChange({
      target: { value: String(nextValue) },
      currentTarget: { value: String(nextValue) },
    });
  }, [onChange]);

  const updateValueFromClientX = useCallback((clientX) => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    if (!rect.width) return;

    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));

    const minValue = Number(min);
    const maxValue = Number(max);
    const stepValue = Number(step) > 0 ? Number(step) : 1;
    const rawValue = minValue + ratio * (maxValue - minValue);
    const snappedValue = minValue + Math.round((rawValue - minValue) / stepValue) * stepValue;
    const nextValue = Math.max(minValue, Math.min(maxValue, snappedValue));

    emitValueChange(nextValue);
  }, [disabled, emitValueChange, max, min, step]);

  const handleThumbPointerDown = useCallback((event) => {
    if (disabled) return;
    event.preventDefault();
    isThumbDraggingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateValueFromClientX(event.clientX);
  }, [disabled, updateValueFromClientX]);

  const handleThumbPointerMove = useCallback((event) => {
    if (!isThumbDraggingRef.current || disabled) return;
    event.preventDefault();
    updateValueFromClientX(event.clientX);
  }, [disabled, updateValueFromClientX]);

  const handleThumbPointerEnd = useCallback((event) => {
    if (!isThumbDraggingRef.current) return;
    event.preventDefault();
    isThumbDraggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  return (
    <div className="range_box" dir="ltr"> 
        <div className="range_wrap">
          <div 
            className="tooltip"
            style={{ right: `${bubbleRightOffset}%`, top: '-48px' }}
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerEnd}
            onPointerCancel={handleThumbPointerEnd}
          >
            {formatNumber(value)} {unit}
            <div className="arrow"><img src={arrow} alt="" /></div>
          </div>
          <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            style={inputStyle}
            className="custom-range-slider "
            disabled={disabled}
          />
        </div>
        <div className="minmax_text " dir="ltr">
          <span className="text-left">{formatNumber(min)} {unit}</span>
          <span className="text-right">{formatNumber(max)} {unit}</span>
        </div>
    </div>
  );
};


export default CustomRangeInput;
