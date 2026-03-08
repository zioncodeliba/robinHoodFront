import React, { useCallback, useRef } from 'react';
import arrow from '../../assets/images/range_arrow.png';

const formatNumber = (num) => {
  return new Intl.NumberFormat('he-IL').format(num);

};


const CustomRangeInput = ({ value, min, max, step, unit, onChange, disabled = false }) => {
  const inputRef = useRef(null);
  const rangeWrapRef = useRef(null);
  const isThumbDraggingRef = useRef(false);

  const getBubblePosition = useCallback((currentValue) => {
    const percentage = ((currentValue - min) / (max - min)) * 100;
    return percentage;
  }, [min, max]);

  const bubblePosition = getBubblePosition(value);
  const bubbleRightOffset = 100 - bubblePosition;

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

  // Use the visible track (range_wrap) for coordinates so drag/tap match the bar and can reach min/max
  const updateValueFromClientX = useCallback((clientX) => {
    if (disabled) return;
    const trackEl = rangeWrapRef.current || inputRef.current;
    if (!trackEl) return;

    const rect = trackEl.getBoundingClientRect();
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

  const handleTrackPointerDown = useCallback((e) => {
    if (disabled) return;
    if (e.target.closest('.tooltip')) return;
    e.preventDefault();
    updateValueFromClientX(e.clientX);
  }, [disabled, updateValueFromClientX]);

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
        <div
          ref={rangeWrapRef}
          className="range_wrap"
          onPointerDown={handleTrackPointerDown}
          style={{ touchAction: 'none' }}
        >
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
            style={{ ...inputStyle, pointerEvents: 'none' }}
            className="custom-range-slider "
            disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
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
