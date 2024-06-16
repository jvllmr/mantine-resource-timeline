import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
export type SchedulerDisplayUnit = "year" | "month" | "week" | "day" | "hour";

export interface SchedulerControllerParams {
  initialViewStartDate?: Dayjs;
  initialViewEndDate?: Dayjs;
  clip?: boolean;
  enableGestures?: boolean;
  onViewStartDateChange?: (date: Dayjs) => void;
  onViewEndDateChange?: (date: Dayjs) => void;
  determineDisplayUnit?: (daysDiff: number) => SchedulerDisplayUnit;
}

export interface SchedulerController {
  moments: Dayjs[];
  momentWidths: number[];
  viewStartDate: Dayjs;
  viewEndDate: Dayjs;
  displayUnit: SchedulerDisplayUnit;
  bodyRef: React.MutableRefObject<HTMLDivElement | null>;
  setViewStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  setViewEndDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  calculateDistancePercentage: (
    date: Dayjs,
    leftOrRight: "left" | "right",
  ) => number;
  enableGestures: boolean | undefined;
}

export function determineDisplayUnit(daysDiff: number): SchedulerDisplayUnit {
  if (daysDiff > 365) return "year";
  if (daysDiff > 25) return "month";

  if (daysDiff > 1) return "day";

  return "hour";
}

const getNextMoment: Record<SchedulerDisplayUnit, (moment: Dayjs) => Dayjs> = {
  day: (moment) => {
    return moment.add(1, "day").hour(0).minute(0).second(0).millisecond(0);
  },
  hour: (moment) => moment.add(1, "hour").minute(0).second(0).millisecond(0),
  week: (moment) =>
    moment.add(1, "week").day(1).hour(0).minute(0).second(0).millisecond(0),
  month: (moment) => {
    return moment
      .add(1, "month")
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);
  },
  year: (moment) =>
    moment
      .add(1, "year")
      .month(0)
      .date(1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0),
};

function clipStartViewDate(date: Dayjs, displayUnit: SchedulerDisplayUnit) {
  switch (displayUnit) {
    case "year":
      return date.month(0).date(1).hour(0).minute(0).second(0).millisecond(0);
    case "month":
      return date.date(1).hour(0).minute(0).second(0).millisecond(0);
    case "week":
      return date.day(1).hour(0).minute(0).second(0).millisecond(0);
    case "day":
      return date.hour(0).minute(0).second(0).millisecond(0);
    case "hour":
      return date.minute(0).second(0).millisecond(0);
  }
}

export function useSchedulerController({
  initialViewEndDate,
  initialViewStartDate,
  clip,
  onViewEndDateChange,
  onViewStartDateChange,
  enableGestures,
  determineDisplayUnit: determineDisplayUnitParam,
}: SchedulerControllerParams): SchedulerController {
  useEffect(() => {
    dayjs.extend(weekOfYear);
    dayjs.extend(localizedFormat);
  }, []);

  const [viewStartDate, setViewStartDate] = useState(
    initialViewStartDate ?? dayjs().subtract(7, "days"),
  );

  useEffect(() => {
    onViewStartDateChange?.(viewStartDate);
  }, [onViewStartDateChange, viewStartDate]);

  const [viewEndDate, setViewEndDate] = useState(
    initialViewEndDate ?? dayjs().add(7, "days"),
  );

  useEffect(() => {
    onViewEndDateChange?.(viewEndDate);
  }, [onViewEndDateChange, viewEndDate]);

  const daysDiff = useMemo(
    () => Math.abs(viewStartDate.diff(viewEndDate, "days", true)),
    [viewEndDate, viewStartDate],
  );

  const bodyRef = useRef<HTMLDivElement | null>(null);

  const customDetermineDisplayUnit = useMemo(
    () => determineDisplayUnitParam ?? determineDisplayUnit,
    [determineDisplayUnitParam],
  );

  const displayUnit: SchedulerDisplayUnit = useMemo(
    () => customDetermineDisplayUnit(daysDiff),
    [customDetermineDisplayUnit, daysDiff],
  );
  const maybeClippedViewStartDate = useMemo(
    () =>
      clip ? clipStartViewDate(viewStartDate, displayUnit) : viewStartDate,
    [clip, displayUnit, viewStartDate],
  );

  const maybeClippedViewEndDate = useMemo(
    () => (clip ? getNextMoment[displayUnit](viewEndDate) : viewEndDate),
    [clip, displayUnit, viewEndDate],
  );

  const displayUnitDiff = useMemo(
    () =>
      Math.abs(
        maybeClippedViewStartDate.diff(
          maybeClippedViewEndDate,
          displayUnit,
          true,
        ),
      ),
    [displayUnit, maybeClippedViewEndDate, maybeClippedViewStartDate],
  );

  const moments = useMemo(() => {
    let diff = displayUnitDiff;
    const result: Dayjs[] = [maybeClippedViewStartDate];
    let latestAddition = maybeClippedViewStartDate;
    while (diff >= 1) {
      diff -= 1;
      const newMoment = getNextMoment[displayUnit](latestAddition);
      if (newMoment.isSame(maybeClippedViewEndDate)) break;
      result.push(newMoment);
      latestAddition = newMoment;
    }

    return result;
  }, [
    displayUnit,
    displayUnitDiff,
    maybeClippedViewEndDate,
    maybeClippedViewStartDate,
  ]);

  const momentWidths = useMemo(
    () =>
      moments.map((moment, index, array) => {
        const distance =
          index < array.length - 1
            ? Math.abs(moment.diff(array[index + 1], displayUnit, true))
            : Math.abs(moment.diff(maybeClippedViewEndDate, displayUnit, true));

        return (distance / (moments.length - 1)) * 100;
      }),
    [displayUnit, maybeClippedViewEndDate, moments],
  );

  const calculateDistancePercentage = useCallback(
    (date: Dayjs, leftOrRight: "left" | "right") => {
      if (leftOrRight === "left") {
        if (date.isBefore(maybeClippedViewStartDate)) return 0;
        return (
          (date.diff(maybeClippedViewStartDate, displayUnit, true) /
            displayUnitDiff) *
          100
        );
      }

      if (date.isAfter(maybeClippedViewEndDate)) return 0;
      return (
        (maybeClippedViewEndDate.diff(date, displayUnit, true) /
          displayUnitDiff) *
        100
      );
    },
    [
      displayUnit,
      displayUnitDiff,
      maybeClippedViewEndDate,
      maybeClippedViewStartDate,
    ],
  );

  return useMemo(
    () => ({
      moments,
      momentWidths,
      viewEndDate,
      viewStartDate,
      displayUnit,
      bodyRef,
      setViewEndDate,
      setViewStartDate,
      calculateDistancePercentage,
      enableGestures,
    }),
    [
      calculateDistancePercentage,
      displayUnit,
      momentWidths,
      moments,
      viewEndDate,
      viewStartDate,
      enableGestures,
    ],
  );
}

export const controllerContext = createContext<SchedulerController | null>(
  null,
);

export function useControllerContext() {
  const controller = useContext(controllerContext);
  if (!controller)
    throw TypeError(
      "Tried to render Scheduler related component outside of controller context",
    );
  return controller;
}
