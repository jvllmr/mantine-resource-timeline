import { Dayjs, isDayjs } from "dayjs";
import { useCallback } from "react";

export type DataFieldAccessor<T, TValue> = keyof T | ((data: T) => TValue);

export function useAccessor<T, TValue>(field: DataFieldAccessor<T, TValue>) {
  return useCallback(
    (obj: T) => {
      if (typeof field === "function") return field(obj);

      return obj[field];
    },

    [field],
  );
}

export function useStringAccessor<T>(field: DataFieldAccessor<T, string>) {
  const getValue = useAccessor(field);

  return useCallback(
    (obj: T) => {
      return String(getValue(obj));
    },
    [getValue],
  );
}

export function useDateAccessor<T>(field: DataFieldAccessor<T, Dayjs>) {
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

export function useArrayAccessor<T, TValue>(
  field: DataFieldAccessor<T, TValue[] | TValue>,
) {
  const getValue = useAccessor(field);

  return useCallback(
    (obj: T) => {
      const value = getValue(obj);

      return Array.isArray(value) ? value : [value];
    },
    [getValue],
  );
}

export function useStringArrayAccessor<T>(
  field: DataFieldAccessor<T, string[] | string>,
) {
  const getValue = useArrayAccessor(field);

  return useCallback(
    (obj: T) => {
      const value = getValue(obj);

      return value.map((item) => String(item));
    },
    [getValue],
  );
}
