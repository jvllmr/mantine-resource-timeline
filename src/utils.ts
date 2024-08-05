import { Dayjs, ManipulateType, isDayjs } from "dayjs";
import { createContext, useCallback } from "react";
import { SchedulerDisplayUnit } from "./controller/controller";

export type DataFieldAccessor<T, TValue> =
  | KeysOfValue<T, TValue>
  | ((data: T) => TValue);

export function useAccessor<T, TValue>(field: DataFieldAccessor<T, TValue>) {
  return useCallback(
    (obj: T) => {
      if (typeof field === "function") return field(obj);

      return obj[field];
    },

    [field],
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStringAccessor<T>(field: DataFieldAccessor<T, any>) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: DataFieldAccessor<T, any[] | any>,
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

export function timeFraction(
  div: number,
  displayUnit: SchedulerDisplayUnit,
): [number, ManipulateType] {
  switch (displayUnit) {
    case "year":
      return [Math.floor(12 / div), "month"];
    case "month":
      return [Math.floor(30 / div), "day"];
    case "week":
      return [Math.floor(168 / div), "hour"];
    case "day":
      return [Math.floor(24 / div), "hour"];
    case "hour":
      return [Math.floor(1440 / div), "minute"];
  }
}

export function createComponentContextFactory<
  TProps extends never,
  TDefault extends React.FC<TProps>,
>(defaultComponent: TDefault) {
  return <TInnerProps extends TProps>() => {
    return createContext<React.FC<TInnerProps>>(defaultComponent);
  };
}

export type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition ? K : never;
}[keyof T];
