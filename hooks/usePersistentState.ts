import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export function usePersistentState<T>(key: string, initialValue: T, maxAgeHours: number = 24): [T, Dispatch<SetStateAction<T>>] {
  // Retrieve from localStorage
  const getSavedValue = (): T => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        const now = new Date().getTime();
        // Check if expired
        if (parsed.expiry && now < parsed.expiry) {
          return parsed.value;
        } else {
          // expired
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Error reading localStorage for', key);
    }
    return initialValue;
  };

  const [value, setValue] = useState<T>(getSavedValue);

  // Sync to localStorage
  useEffect(() => {
    try {
      const expiry = new Date().getTime() + maxAgeHours * 60 * 60 * 1000;
      localStorage.setItem(key, JSON.stringify({ value, expiry }));
    } catch (e) {
      console.warn('Error setting localStorage for', key);
    }
  }, [key, value, maxAgeHours]);

  return [value, setValue];
}
