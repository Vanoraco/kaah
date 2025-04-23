import {useEffect, useRef, useState, useCallback} from 'react';

export function Slider({min, max, step, value, onChange}) {
  const [sliderValues, setSliderValues] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);
  const trackRef = useRef(null);
  const rangeRef = useRef(null);
  const activeThumbRef = useRef(null);

  // Update internal state when external value changes
  useEffect(() => {
    setSliderValues(value);
  }, [value]);

  // Calculate percentage for positioning
  const getPercent = useCallback((value) => {
    return Math.round(((value - min) / (max - min)) * 100);
  }, [min, max]);

  // Update slider visuals
  useEffect(() => {
    if (trackRef.current && rangeRef.current && minThumbRef.current && maxThumbRef.current) {
      const minPercent = getPercent(sliderValues[0]);
      const maxPercent = getPercent(sliderValues[1]);

      // Update the range track width and position
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;

      // Update thumb positions
      minThumbRef.current.style.left = `${minPercent}%`;
      maxThumbRef.current.style.left = `${maxPercent}%`;
    }
  }, [sliderValues, getPercent]);

  // Handle min thumb change
  const handleMinChange = (e) => {
    e.preventDefault();
    const newMinVal = Math.min(parseInt(e.target.value), sliderValues[1] - step);
    const newValues = [newMinVal, sliderValues[1]];
    setSliderValues(newValues);
    onChange(newValues);
  };

  // Handle max thumb change
  const handleMaxChange = (e) => {
    e.preventDefault();
    const newMaxVal = Math.max(parseInt(e.target.value), sliderValues[0] + step);
    const newValues = [sliderValues[0], newMaxVal];
    setSliderValues(newValues);
    onChange(newValues);
  };

  // Handle click on track to move closest thumb
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const percent = (e.clientX - trackRect.left) / trackRect.width;
    const rawValue = min + percent * (max - min);
    const snappedValue = Math.round(rawValue / step) * step;

    // Determine which thumb to move based on which is closer
    const distToMin = Math.abs(snappedValue - sliderValues[0]);
    const distToMax = Math.abs(snappedValue - sliderValues[1]);

    if (distToMin <= distToMax) {
      const newValues = [Math.min(snappedValue, sliderValues[1] - step), sliderValues[1]];
      setSliderValues(newValues);
      onChange(newValues);
    } else {
      const newValues = [sliderValues[0], Math.max(snappedValue, sliderValues[0] + step)];
      setSliderValues(newValues);
      onChange(newValues);
    }
  };

  // Handle mouse/touch move events for smoother dragging
  const handleMove = useCallback((e) => {
    if (!isDragging || !activeThumbRef.current || !trackRef.current) return;

    // Get position for touch or mouse event
    const clientX = e.type.includes('touch')
      ? e.touches[0].clientX
      : e.clientX;

    const trackRect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - trackRect.left) / trackRect.width));
    const rawValue = min + percent * (max - min);
    const snappedValue = Math.round(rawValue / step) * step;

    // Update the appropriate thumb
    if (activeThumbRef.current === minThumbRef.current) {
      const newMinVal = Math.min(snappedValue, sliderValues[1] - step);
      const newValues = [newMinVal, sliderValues[1]];
      setSliderValues(newValues);
      onChange(newValues);
    } else {
      const newMaxVal = Math.max(snappedValue, sliderValues[0] + step);
      const newValues = [sliderValues[0], newMaxVal];
      setSliderValues(newValues);
      onChange(newValues);
    }
  }, [isDragging, min, max, step, sliderValues, onChange]);

  // Set up event listeners for dragging
  useEffect(() => {
    const handleUp = () => {
      setIsDragging(false);
      activeThumbRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove]);

  // Prevent default behavior to avoid page scrolling while dragging on mobile
  useEffect(() => {
    const preventDefaultTouch = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, [isDragging]);

  // Handle start dragging
  const handleStart = (e, thumbRef) => {
    e.stopPropagation();
    setIsDragging(true);
    activeThumbRef.current = thumbRef.current;
  };

  return (
    <div className="dual-range-slider" ref={sliderRef}>
      <div
        className="slider-track"
        ref={trackRef}
        onClick={handleTrackClick}
      ></div>
      <div className="slider-range" ref={rangeRef}></div>

      <div
        className="thumb-container thumb-min-container"
        style={{ left: `${getPercent(sliderValues[0])}%` }}
        onMouseDown={(e) => handleStart(e, minThumbRef)}
        onTouchStart={(e) => handleStart(e, minThumbRef)}
      >
        <div className="thumb-value">${sliderValues[0]}</div>
        <div className="thumb thumb-min" ref={minThumbRef}></div>
      </div>

      <div
        className="thumb-container thumb-max-container"
        style={{ left: `${getPercent(sliderValues[1])}%` }}
        onMouseDown={(e) => handleStart(e, maxThumbRef)}
        onTouchStart={(e) => handleStart(e, maxThumbRef)}
      >
        <div className="thumb-value">${sliderValues[1]}</div>
        <div className="thumb thumb-max" ref={maxThumbRef}></div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValues[0]}
        onChange={handleMinChange}
        className="thumb-input"
        aria-label="Minimum price"
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValues[1]}
        onChange={handleMaxChange}
        className="thumb-input"
        aria-label="Maximum price"
      />
    </div>
  );
}
