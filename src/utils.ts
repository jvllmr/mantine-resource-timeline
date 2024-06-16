import { isDayjs } from "dayjs";
import { useCallback } from "react";

export function useAccessor<T>(field: keyof T) {
  return useCallback(
    (obj: T) => {
      return obj[field];
    },

    [field],
  );
}

export function useStringAccessor<T>(field: keyof T) {
  const getValue = useAccessor(field);

  return useCallback(
    (obj: T) => {
      return String(getValue(obj));
    },
    [getValue],
  );
}

export function useDateAccessor<T>(field: keyof T) {
  const getValue = useAccessor(field);

  return useCallback(
    (obj: T) => {
      const value = getValue(obj);
      if (isDayjs(value)) return value;
      throw TypeError(`Expected date value Received: ${value}`);
    },
    [getValue],
  );
}
