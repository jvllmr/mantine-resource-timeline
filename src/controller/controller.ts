import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { proxy, subscribe } from "valtio";
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
  bodyRef: HTMLDivElement | null;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateDisplayUnit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: SchedulerController<any, any>,
  calcFn?: (diff: number) => SchedulerDisplayUnit,
) {
  const daysDiff = Math.abs(
    controller.viewStartDate.diff(controller.viewEndDate, "days", true),
  );
  const customDetermineDisplayUnit = calcFn ?? determineDisplayUnit;
  const newDisplayUnit = customDetermineDisplayUnit(daysDiff);
  if (newDisplayUnit !== controller.displayUnit) {
    controller.displayUnit = newDisplayUnit;
  }
}

function calculateMoments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: SchedulerController<any, any>,
  clip?: boolean,
) {
  const maybeClippedViewStartDate = clip
    ? clipStartViewDate(controller.viewStartDate, controller.displayUnit)
    : controller.viewStartDate;
  const maybeClippedViewEndDate = clip
    ? getNextMoment[controller.displayUnit](controller.viewEndDate)
    : controller.viewEndDate;

  const displayUnitDiff = Math.abs(
    maybeClippedViewStartDate.diff(
      maybeClippedViewEndDate,
      controller.displayUnit,
      true,
    ),
  );

  let diff = displayUnitDiff;
  const moments: Dayjs[] = [maybeClippedViewStartDate];
  let latestAddition = maybeClippedViewStartDate;
  while (diff >= 1) {
    diff -= 1;
    const newMoment = getNextMoment[controller.displayUnit](latestAddition);
    if (newMoment.isSame(maybeClippedViewEndDate)) break;
    moments.push(newMoment);
    latestAddition = newMoment;
  }
  controller.moments = moments;
  const momentWidths = moments.map((moment, index, array) => {
    const distance =
      index < array.length - 1
        ? Math.abs(moment.diff(array[index + 1], controller.displayUnit, true))
        : Math.abs(
            moment.diff(maybeClippedViewEndDate, controller.displayUnit, true),
          );

    return (distance / (moments.length - 1)) * 100;
  });

  controller.momentWidths = momentWidths;

  controller.calculateDistancePercentage = (
    date: Dayjs,
    leftOrRight: "left" | "right",
  ) => {
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

    return (
      (right.diff(left, controller.displayUnit, true) / displayUnitDiff) * 100
    );
  };
}

export function useSchedulerController<TData, TResource>({
  initialViewEndDate,
  initialViewStartDate,
  clip,

  onSelect,

  determineDisplayUnit: determineDisplayUnitParam,
}: SchedulerControllerParams<TData, TResource>): SchedulerController<
  TData,
  TResource
> {
  const controller = useRef(
    proxy<SchedulerController<TData, TResource>>({
      bodyRef: null,
      calculateDistancePercentage: () => 0,
      displayUnit: "day",
      firstSelectedMoment: null,
      lastSelectedMoment: null,
      moments: [],
      momentWidths: [],
      selectedResource: null,

      viewStartDate: dayjs().subtract(7, "days"),
      viewEndDate: dayjs().add(7, "days"),
    }),
  ).current;
  useMemo(() => {
    dayjs.extend(weekOfYear);
    dayjs.extend(localizedFormat);
    dayjs.extend(timezone);
  }, []);

  useEffect(() => {
    if (
      initialViewStartDate &&
      !initialViewStartDate.isSame(controller.viewStartDate)
    ) {
      controller.viewStartDate = initialViewStartDate;
    }
    if (
      initialViewEndDate &&
      !initialViewEndDate.isSame(controller.viewEndDate)
    ) {
      controller.viewEndDate = initialViewEndDate;
    }
  }, [controller, initialViewEndDate, initialViewStartDate]);

  useEffect(() => {
    calculateDisplayUnit(controller, determineDisplayUnitParam);
    const unsubscribe = subscribe(controller, (ops) => {
      if (
        !ops.find(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([op, key]) => key[0] === "viewStartDate" || key[0] === "viewEndDate",
        )
      ) {
        return;
      }
      calculateDisplayUnit(controller, determineDisplayUnitParam);
    });

    return () => {
      unsubscribe();
    };
  }, [controller, determineDisplayUnitParam]);

  useEffect(() => {
    calculateMoments(controller, clip);
    const unsubscribe = subscribe(controller, (ops) => {
      if (
        !ops.find(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([op, key]) =>
            key[0] === "viewStartDate" ||
            key[0] === "viewEndDate" ||
            key[0] === "displayUnit",
        )
      )
        return;
      calculateMoments(controller, clip);
    });
    return () => {
      unsubscribe();
    };
  }, [clip, controller]);

  useSchedulerSelect(controller, onSelect);

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
