import { useEffect, useState } from "react";

/**
 * Animate a number from 0 to a target value with an ease-out curve.
 * Runs only on the client — safe to use in SSR components.
 */
export function useAnimatedNumber(target: number, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    let start: number | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    timeout = setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      if (timeout) clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}
