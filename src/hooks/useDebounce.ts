import { useEffect } from "react";

/**
 * Custom hook that runs an effect after a debounce delay,
 * automatically cancelling and cleaning up the previous timer on changes.
 *
 * @param callback The function to execute after inactivity (typically wrapped in useCallback).
 * @param delay Debounce delay in milliseconds (defaults to 200ms).
 */
export function useDebouncedEffect(callback: () => void, delay = 200): void {
  useEffect(() => {
    const timer = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [callback, delay]);
}
