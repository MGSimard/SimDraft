import { useRef, useEffect, useState, useCallback } from "react";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = undefined;
    }, delay);
  };
}

function getDeviceType(): "touch" | "pointer" | "mouse" {
  if (typeof window === "undefined") return "mouse";
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (hasCoarsePointer && hasTouch) {
    return "touch";
  } else if (hasFinePointer) {
    return "pointer";
  } else {
    return "mouse";
  }
}

interface ScrollContainerProps {
  children: React.ReactNode;
}
interface ExtendedCSSProperties extends React.CSSProperties {
  WebkitOverflowScrolling?: "auto" | "touch";
}
export function ScrollContainer({ children }: ScrollContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [clientDeviceType, setClientDeviceType] = useState<"touch" | "pointer" | "mouse">("mouse");
  const thumbTopTarget = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setClientDeviceType(getDeviceType());
  }, []);

  const handleScrollStart = useCallback(() => {
    if (clientDeviceType === "touch") {
      setIsScrolling(true);
      setShowScrollbar(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setShowScrollbar(false);
      }, 1000);
    }
  }, [clientDeviceType]);

  const updateThumb = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    if (scrollHeight <= clientHeight) {
      setShowScrollbar(false);
      return;
    }
    const ratio = clientHeight / scrollHeight;
    const height = Math.max(clientHeight * ratio, 32);
    setThumbHeight(height);
    const newThumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height) || 0;
    if (clientDeviceType === "touch") {
      thumbTopTarget.current = newThumbTop;
      setThumbTop(newThumbTop);
    } else {
      setThumbTop(newThumbTop);
    }
    setScrollRatio(scrollTop / (scrollHeight - clientHeight) || 0);
    if (clientDeviceType !== "touch") {
      setShowScrollbar(true);
    }
  }, [clientDeviceType]);

  useEffect(() => {
    if (clientDeviceType !== "touch") return;

    let frame: number;
    function animate() {
      setThumbTop((prev) => {
        const target = thumbTopTarget.current;
        const next = prev + (target - prev) * 0.2;
        if (Math.abs(next - target) < 0.5) {
          return target;
        }
        frame = requestAnimationFrame(animate);
        return next;
      });
    }
    if (isScrolling) {
      frame = requestAnimationFrame(animate);
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [clientDeviceType, isScrolling]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleScroll = () => {
      updateThumb();
      handleScrollStart();
    };
    const debouncedUpdateThumb = debounce(updateThumb, 150);
    updateThumb();
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", debouncedUpdateThumb);
    let resizeObserver: ResizeObserver;
    if (typeof window.ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateThumb();
      });
      resizeObserver.observe(viewport);
    }

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", debouncedUpdateThumb);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateThumb, handleScrollStart]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const thumb = thumbRef.current;
    if (!viewport || !thumb) return;
    let isDragging = false;
    let initialOffset = 0;
    const pointerEventOptions = { capture: true };
    const handlePointerDown = (e: PointerEvent) => {
      if (e.target !== thumb) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      const thumbRect = thumb.getBoundingClientRect();
      initialOffset = e.clientY - thumbRect.top;
      document.addEventListener("pointermove", handlePointerMove, pointerEventOptions);
      document.addEventListener("pointerup", handlePointerUp, pointerEventOptions);
      document.addEventListener("pointercancel", handlePointerUp, pointerEventOptions);
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();
      const { scrollHeight, clientHeight } = viewport;
      const maxScroll = scrollHeight - clientHeight;
      const maxThumbMove = clientHeight - thumbHeight;
      const track = thumb.parentElement as HTMLElement;
      const trackRect = track.getBoundingClientRect();
      let newThumbTop = e.clientY - trackRect.top - initialOffset;
      newThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbMove));
      const scrollRatio = maxThumbMove > 0 ? newThumbTop / maxThumbMove : 0;
      const newScrollTop = scrollRatio * maxScroll;
      viewport.scrollTop = newScrollTop;
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      document.removeEventListener("pointermove", handlePointerMove, pointerEventOptions);
      document.removeEventListener("pointerup", handlePointerUp, pointerEventOptions);
      document.removeEventListener("pointercancel", handlePointerUp, pointerEventOptions);
    };
    thumb.addEventListener("pointerdown", handlePointerDown);
    return () => {
      thumb.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove, pointerEventOptions);
      document.removeEventListener("pointerup", handlePointerUp, pointerEventOptions);
      document.removeEventListener("pointercancel", handlePointerUp, pointerEventOptions);
    };
  }, [thumbHeight]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === thumbRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const track = e.currentTarget;
    const trackRect = track.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const thumbCenter = thumbHeight / 2;
    const maxThumbMove = trackRect.height - thumbHeight;
    let newThumbTop = clickY - thumbCenter;
    newThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbMove));
    const { scrollHeight, clientHeight } = viewport;
    const maxScroll = scrollHeight - clientHeight;
    const scrollRatio = maxThumbMove > 0 ? newThumbTop / maxThumbMove : 0;
    const newScrollTop = scrollRatio * maxScroll;
    viewport.scrollTop = newScrollTop;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { clientHeight, scrollHeight } = viewport;
    let handled = true;
    switch (e.key) {
      case "ArrowDown":
        viewport.scrollTop += 40;
        break;
      case "ArrowUp":
        viewport.scrollTop -= 40;
        break;
      case "PageDown":
        viewport.scrollTop += clientHeight * 0.9;
        break;
      case "PageUp":
        viewport.scrollTop -= clientHeight * 0.9;
        break;
      case " ":
        if (!e.shiftKey) {
          viewport.scrollTop += clientHeight * 0.9;
        } else {
          viewport.scrollTop -= clientHeight * 0.9;
        }
        break;
      case "Home":
        viewport.scrollTop = 0;
        break;
      case "End":
        viewport.scrollTop = scrollHeight;
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleScrollbarKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDown(e);
  };

  useEffect(() => {
    if (clientDeviceType === "touch") return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      viewport.scrollTop += e.deltaY;
      handleScrollStart();
    };
    viewport.addEventListener("wheel", handleWheel);
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [handleScrollStart, clientDeviceType]);

  useEffect(() => {
    if (clientDeviceType !== "touch") return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    (viewport.style as ExtendedCSSProperties).WebkitOverflowScrolling = "touch";
    return () => {
      (viewport.style as ExtendedCSSProperties).WebkitOverflowScrolling = undefined;
    };
  }, [clientDeviceType]);

  useEffect(() => {
    updateThumb();
  }, [updateThumb]);

  const ariaProps = {
    role: "scrollbar" as const,
    "aria-controls": "champion-list",
    "aria-orientation": "vertical" as const,
    "aria-valuenow": Math.round(scrollRatio * 100),
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-label": "Champion list scrollbar",
    tabIndex: 0,
    onKeyDown: handleScrollbarKeyDown,
  };

  const shouldShowScrollbar = showScrollbar && thumbHeight > 0 && (clientDeviceType !== "touch" || isScrolling);

  return (
    <div id="champion-list-wrapper" ref={wrapperRef}>
      <div
        id="champion-list"
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="champion-list"
        style={
          {
            overflowY: clientDeviceType === "touch" ? "auto" : "hidden",
            WebkitOverflowScrolling: clientDeviceType === "touch" ? "touch" : undefined,
          } as ExtendedCSSProperties
        }>
        {children}
      </div>
      {shouldShowScrollbar && (
        <div
          id="scrollbar-track"
          className={clientDeviceType === "touch" ? "scrollbarTrackTouch" : undefined}
          onClick={handleTrackClick}
          {...ariaProps}>
          <div
            id="scrollbar-thumb"
            ref={thumbRef}
            tabIndex={-1}
            className={clientDeviceType === "touch" ? "thumbTouch" : undefined}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
