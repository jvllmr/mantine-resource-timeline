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
import {
  OnSelectFn,
  SchedulerMomentOnDragEndFn,
  SchedulerMomentOnDragStartOverFactory,
  SchedulerMomentSelectClickFnFactory,
  useSchedulerSelect,
} from "./selectControls";

export type SchedulerDisplayUnit = "year" | "month" | "week" | "day" | "hour";

export interface SchedulerControllerParams<TData, TResource> {
  initialViewStartDate?: Dayjs;
  initialViewEndDate?: Dayjs;
  clip?: boolean;

  onViewStartDateChange?: (date: Dayjs) => void;
  onViewEndDateChange?: (date: Dayjs) => void;
  determineDisplayUnit?: (daysDiff: number) => SchedulerDisplayUnit;
  onSelect?: OnSelectFn<TData, TResource>;
}

// @ts-expect-error TData is unused for now
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface SchedulerController<TData, TResource> {
  moments: Dayjs[];
  momentWidths: number[];
  viewStartDate: Dayjs;
  viewEndDate: Dayjs;
  displayUnit: SchedulerDisplayUnit;

  setViewStartDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  setViewEndDate: React.Dispatch<React.SetStateAction<Dayjs>>;
  calculateDistancePercentage: (
    date: Dayjs,
    leftOrRight: "left" | "right",
  ) => number;

  momentDragEnd?: SchedulerMomentOnDragEndFn<TResource>;
  momentDragStartOver?: SchedulerMomentOnDragStartOverFactory<TResource>;
  momentSelectClick?: SchedulerMomentSelectClickFnFactory<TResource>;
  firstSelectedMoment: Dayjs | null;
  lastSelectedMoment: Dayjs | null;
  selectedResource: TResource | null;
  bodyRef: React.MutableRefObject<HTMLDivElement | null>;
}
export type UnknownSchedulerController = SchedulerController<unknown, unknown>;

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

export function useSchedulerController<TData, TResource>({
  initialViewEndDate,
  initialViewStartDate,
  clip,
  onViewEndDateChange,
  onViewStartDateChange,

  onSelect,

  determineDisplayUnit: determineDisplayUnitParam,
}: SchedulerControllerParams<TData, TResource>): SchedulerController<
  TData,
  TResource
> {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  useMemo(() => {
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
      if (
        date.isBefore(maybeClippedViewStartDate) ||
        date.isAfter(maybeClippedViewEndDate)
      )
        return 0;

      let left = maybeClippedViewStartDate;
      let right = date;

      if (leftOrRight === "right") {
        left = date;
        right = maybeClippedViewEndDate;
      }

      return (right.diff(left, displayUnit, true) / displayUnitDiff) * 100;
    },
    [
      displayUnit,
      displayUnitDiff,
      maybeClippedViewEndDate,
      maybeClippedViewStartDate,
    ],
  );

  const selectControls = useSchedulerSelect(onSelect);

  const controller: SchedulerController<TData, TResource> = useMemo(
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

      firstSelectedMoment: selectControls.firstMoment,
      lastSelectedMoment: selectControls.lastMoment,
      momentDragEnd: selectControls.onDragEnd,
      momentDragStartOver: selectControls.onDragStartOverFactory,
      selectedResource: selectControls.selectedResource,
      momentSelectClick: selectControls.selectClick,
    }),
    [
      moments,
      momentWidths,
      viewEndDate,
      viewStartDate,
      displayUnit,
      calculateDistancePercentage,
      selectControls.firstMoment,
      selectControls.lastMoment,
      selectControls.onDragEnd,
      selectControls.onDragStartOverFactory,
      selectControls.selectedResource,
      selectControls.selectClick,
    ],
  );

  useEffect(() => {
    selectControls.setController(controller);
  }, [controller, selectControls]);

  return controller;
}

export const controllerContext = createContext<SchedulerController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> | null>(null);

export function useControllerContext() {
  const controller = useContext(controllerContext);
  if (!controller)
    throw TypeError(
      "Tried to render Scheduler related component outside of controller context",
    );
  return controller;
}
