import { useState, useEffect } from 'react';

/**
 * Delays updating the returned value until `delay` ms have passed without a new value.
 * Useful for deferring search queries while the user is still typing.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
