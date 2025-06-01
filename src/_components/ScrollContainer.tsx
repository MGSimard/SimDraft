import { useRef, useEffect, useState, useCallback, useMemo } from "react";

interface ScrollContainerProps {
  children: React.ReactNode;
}

// 5. Type Safety for WebkitOverflowScrolling
// Ensure it aligns with React's CSSProperties or common DOM typings.
// The linter suggests 'WebkitOverflowScrolling' (capital W)
interface ExtendedCSSProperties extends React.CSSProperties {
  WebkitOverflowScrolling?: "auto" | "touch"; // Removed "" as it's covered by undefined for optional props
}

// 6. Debounce utility
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
  // Check if we're on the client side
  if (typeof window === "undefined") return "mouse";

  // Primary input mechanism detection
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (hasCoarsePointer && hasTouch) {
    return "touch"; // Mobile touch device
  } else if (hasFinePointer) {
    return "pointer"; // Desktop/laptop with trackpad or mouse
  } else {
    return "mouse"; // Fallback
  }
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

  // Show scrollbar temporarily on mobile touch devices when scrolling
  const handleScrollStart = useCallback(() => {
    if (clientDeviceType === "touch") {
      setIsScrolling(true);
      setShowScrollbar(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide scrollbar after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setShowScrollbar(false);
      }, 1000);
    }
  }, [clientDeviceType]);

  // Calculate thumb size and position
  const updateThumb = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;

    // Don't show scrollbar if content doesn't overflow
    if (scrollHeight <= clientHeight) {
      setShowScrollbar(false);
      return;
    }

    const ratio = clientHeight / scrollHeight;
    const height = Math.max(clientHeight * ratio, 32); // min thumb height
    setThumbHeight(height);

    const newThumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height) || 0;

    if (clientDeviceType === "touch") {
      thumbTopTarget.current = newThumbTop;
      // Trigger animation by updating thumbTop directly for immediate feedback
      setThumbTop(newThumbTop);
    } else {
      setThumbTop(newThumbTop);
    }

    setScrollRatio(scrollTop / (scrollHeight - clientHeight) || 0);

    // Always show scrollbar on non-touch devices when content overflows
    // On touch devices, only show when scrolling
    if (clientDeviceType !== "touch") {
      setShowScrollbar(true);
    }
  }, [clientDeviceType]);

  // Animate thumbTop toward thumbTopTarget on touch devices
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

    // Only animate if we're actively scrolling to avoid unnecessary animations
    if (isScrolling) {
      frame = requestAnimationFrame(animate);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [clientDeviceType, isScrolling]);

  // Sync thumb on scroll/resize
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      updateThumb();
      handleScrollStart();
    };

    // 6. Debounce updateThumb for window resize
    const debouncedUpdateThumb = debounce(updateThumb, 150);

    updateThumb(); // Initial call
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", debouncedUpdateThumb);

    // 7. ResizeObserver for dynamic content changes in viewport
    let resizeObserver: ResizeObserver;
    if (typeof window.ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        // We can use the debounced version here too if updates are too frequent
        // or if updateThumb is expensive. For now, direct call.
        updateThumb();
      });
      resizeObserver.observe(viewport);

      // Optionally, observe direct children if their resize doesn't reliably trigger viewport scrollHeight change
      // Array.from(viewport.children).forEach(child => {
      //   if (child instanceof HTMLElement) resizeObserver.observe(child);
      // });
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
  }, [updateThumb, handleScrollStart]); // updateThumb is a dependency

  // Enhanced drag logic with capture
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

      // Calculate initial offset between pointer and thumb top
      const thumbRect = thumb.getBoundingClientRect();
      initialOffset = e.clientY - thumbRect.top;

      // Prevent text selection
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";

      // Use capture to ensure we get all pointer events
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

      // Get the track element (parent of thumb)
      const track = thumb.parentElement as HTMLElement;
      const trackRect = track.getBoundingClientRect();

      // Calculate new thumb position accounting for initial offset
      let newThumbTop = e.clientY - trackRect.top - initialOffset;
      newThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbMove));

      // Convert thumb position to scroll position
      const scrollRatio = maxThumbMove > 0 ? newThumbTop / maxThumbMove : 0;
      const newScrollTop = scrollRatio * maxScroll;

      viewport.scrollTop = newScrollTop;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;

      isDragging = false;

      // Restore text selection
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";

      // Remove capture listeners
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

  // Track click-to-jump logic
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === thumbRef.current) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const track = e.currentTarget;
    const trackRect = track.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;

    // Center the thumb on the click position
    const thumbCenter = thumbHeight / 2;
    const maxThumbMove = trackRect.height - thumbHeight;
    let newThumbTop = clickY - thumbCenter;
    newThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbMove));

    // Convert thumb position to scroll position
    const { scrollHeight, clientHeight } = viewport;
    const maxScroll = scrollHeight - clientHeight;
    const scrollRatio = maxThumbMove > 0 ? newThumbTop / maxThumbMove : 0;
    const newScrollTop = scrollRatio * maxScroll;

    viewport.scrollTop = newScrollTop;
  };

  // Enhanced keyboard navigation - attach to viewport
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
        viewport.scrollTop += clientHeight * 0.9; // Slight overlap
        break;
      case "PageUp":
        viewport.scrollTop -= clientHeight * 0.9; // Slight overlap
        break;
      case " ": // Spacebar
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

  // Scrollbar-specific keyboard navigation
  const handleScrollbarKeyDown = (e: React.KeyboardEvent) => {
    // Same logic but for the scrollbar element
    handleKeyDown(e);
  };

  // Wheel event handling - attach to viewport for desktop
  useEffect(() => {
    if (clientDeviceType === "touch") return; // Let mobile handle scroll naturally

    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent default scroll behavior

      // Apply scroll delta to viewport
      viewport.scrollTop += e.deltaY;

      handleScrollStart();
    };

    viewport.addEventListener("wheel", handleWheel);

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [handleScrollStart, clientDeviceType]);

  // Momentum scrolling for touch devices
  useEffect(() => {
    if (clientDeviceType !== "touch") return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    // Add momentum scrolling CSS (using ExtendedCSSProperties)
    // Linter suggested 'WebkitOverflowScrolling' (capital W)
    (viewport.style as ExtendedCSSProperties).WebkitOverflowScrolling = "touch";
    // viewport.style.overflowY is managed by the style prop based on clientDeviceType

    return () => {
      // Use 'undefined' to remove the style or set to a default if necessary
      (viewport.style as ExtendedCSSProperties).WebkitOverflowScrolling = undefined;
      // viewport.style.overflowY will revert based on JSX style prop
    };
  }, [clientDeviceType]);

  // Initial thumb calculation
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
        style={
          {
            overflowY: clientDeviceType === "touch" ? "auto" : "hidden",
            WebkitOverflowScrolling: clientDeviceType === "touch" ? "touch" : undefined,
          } as ExtendedCSSProperties // Use ExtendedCSSProperties
        }>
        {children}
      </div>
      {shouldShowScrollbar && (
        <div
          id="scrollbar-track"
          {...ariaProps}
          onClick={handleTrackClick}
          style={{
            opacity: clientDeviceType === "touch" && !isScrolling ? 0.7 : 1,
            transition: clientDeviceType === "touch" ? "opacity 0.3s ease" : undefined,
          }}>
          <div
            id="scrollbar-thumb"
            ref={thumbRef}
            tabIndex={-1}
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbTop}px)`,
              transition: clientDeviceType === "touch" ? "transform 0.1s ease-out" : undefined,
            }}
          />
        </div>
      )}
    </div>
  );
}
