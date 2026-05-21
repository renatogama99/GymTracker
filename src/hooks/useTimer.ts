import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  initialSeconds: number;
  countDown: boolean;
  onFinish?: () => void;
  autoStart?: boolean;
}

export function useTimer({
  initialSeconds,
  countDown,
  onFinish,
  autoStart = false,
}: UseTimerOptions) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(autoStart);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const tick = useCallback(() => {
    setSeconds((prev) => {
      if (countDown) {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          onFinishRef.current?.();
          return 0;
        }
        return prev - 1;
      } else {
        return prev + 1;
      }
    });
  }, [countDown]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const start = useCallback(() => {
    setRunning(true);
    setFinished(false);
  }, []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setFinished(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);
  const toggle = useCallback(() => setRunning((r) => !r), []);

  return { seconds, running, finished, start, pause, reset, toggle };
}
