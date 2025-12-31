"use client";

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      const value = item ? JSON.parse(item) : initialValue;
      setStoredValue(value);
    } catch (error) {
      console.log(error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === "undefined") {
      console.warn(`Tried to set localStorage key “${key}” even though window is not defined`);
      return;
    }

    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
