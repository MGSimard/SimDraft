import { useEffect, useRef, useState } from "react";

interface SmartTooltipProps {
  children: React.ReactNode;
  tooltip: string;
  id?: string;
}

export function SmartTooltip({ children, tooltip, id }: SmartTooltipProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, arrowOffset: 0 });

  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current;
    const tooltip = tooltipRef.current;

    const containerRect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const containerCenter = containerRect.left + containerRect.width / 2;
    const idealLeft = containerCenter - tooltipRect.width / 2;
    const idealTop = containerRect.top - tooltipRect.height - 8;

    const sitePaddingValue = getComputedStyle(document.documentElement).getPropertyValue("--sitePadding");
    const sitePadding = sitePaddingValue ? parseFloat(sitePaddingValue) * 10 : 16;
    const minLeft = sitePadding;
    const maxLeft = window.innerWidth - tooltipRect.width - sitePadding;

    const actualLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft));
    const actualTop = idealTop;

    const arrowOffset = idealLeft - actualLeft;

    setPosition({
      top: actualTop,
      left: actualLeft,
      arrowOffset: arrowOffset,
    });
  };

  const showTooltip = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsVisible(true);
    animationRef.current = requestAnimationFrame(() => {
      calculatePosition();
      animationRef.current = null;
    });
  };

  const hideTooltip = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isVisible) {
          calculatePosition();
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isVisible, calculatePosition]);

  return (
    <div
      ref={containerRef}
      className="tooltip-detect"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}>
      {children}
      <div
        ref={tooltipRef}
        role="tooltip"
        id={id}
        className="tooltip"
        aria-hidden={!isVisible}
        style={
          {
            visibility: isVisible ? "visible" : "hidden",
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "none",
            "--arrow-offset": `${position.arrowOffset}px`,
          } as React.CSSProperties
        }>
        <span>{tooltip}</span>
      </div>
    </div>
  );
}
