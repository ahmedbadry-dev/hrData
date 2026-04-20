import { useEffect, useState } from 'react';

const easeOutExpo = (value: number): number => (value === 1 ? 1 : 1 - Math.pow(2, -10 * value));

export const useCountUp = (
  targetValue: number | null | undefined,
  isLoading: boolean,
  duration = 1000
): number => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (
      isLoading ||
      targetValue === null ||
      targetValue === undefined ||
      !Number.isFinite(targetValue)
    ) {
      setValue(0);
      return;
    }

    const target = Math.max(0, Math.round(targetValue));
    if (target === 0) {
      setValue(0);
      return;
    }

    const startTime = performance.now();
    const safeDuration = Math.max(1, duration);
    let frameId = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / safeDuration, 1);
      const easedProgress = easeOutExpo(progress);
      setValue(Math.round(target * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    setValue(0);
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [duration, isLoading, targetValue]);

  return value;
};