import dayjs, { Dayjs } from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useEffect, useMemo, useRef } from "react";
import { proxy, subscribe } from "valtio";
import { timeFraction } from "../utils";
import {
  OnSelectFn,
  SchedulerMomentOnDragEndFn,
  SchedulerMomentOnDragStartOverFactory,
  SchedulerMomentSelectClickFnFactory,
  useSchedulerSelect,
} from "./selectControls";
export type SchedulerDisplayUnit = "year" | "month" | "week" | "day" | "hour";
export type DetermineSubMomentCountsFn = (
  displayUnit: SchedulerDisplayUnit,
) => number;
export interface SchedulerControllerParams<TData, TResource> {
  initialViewStartDate?: Dayjs;
  initialViewEndDate?: Dayjs;
  clip?: boolean;
  determineSubMomentsCount?: DetermineSubMomentCountsFn;
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
  subbedMoments: [Dayjs, number][];
  calculateDistancePercentage: (
    date: Dayjs,
    leftOrRight: "left" | "right",
  ) => number;

  momentDragEnd?: SchedulerMomentOnDragEndFn<TResource>;
  momentDragStartOver?: SchedulerMomentOnDragStartOverFactory;
  momentSelectClick?: SchedulerMomentSelectClickFnFactory<TResource>;
  firstSelectedMoment: Dayjs | null;
  lastSelectedMoment: Dayjs | null;

  selectedMoments: Record<
    string,
    Record<string, { isSelected: boolean } | undefined> | undefined
  >;
  selectedResourceId: string | null;
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

function calculateSubMoments( // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: SchedulerController<any, any>,
  determineSubMomentCounts?: DetermineSubMomentCountsFn,
) {
  const { momentWidths, moments } = controller;

  const firstMomentLoss = (momentWidths[0] / 100) * (momentWidths.length - 1);
  const lastMomentLoss =
    (momentWidths[momentWidths.length - 1] / 100) * (momentWidths.length - 1);
  const zippedMoments = moments.map((moment, index): [Dayjs, number] => [
    moment,
    momentWidths[index],
  ]);
  const subMomentCount =
    determineSubMomentCounts?.(controller.displayUnit) ?? 0;
  const subbedMoments = zippedMoments.flatMap(
    ([moment, distance], momentIndex): [Dayjs, number][] => {
      const loss =
        momentIndex === 0
          ? firstMomentLoss
          : momentIndex === zippedMoments.length
            ? lastMomentLoss
            : 1;
      const subMomentCountWithLoss = Math.ceil(subMomentCount * loss);
      if (subMomentCountWithLoss < 2) return [[moment, distance]];
      const newDistance = distance / subMomentCountWithLoss;
      const newMoments = [moment];
      let newestMoment = moment;
      const fraction = timeFraction(
        subMomentCountWithLoss,
        controller.displayUnit,
      );
      for (let i = 1; i < subMomentCountWithLoss; i++) {
        newestMoment = newestMoment.add(...fraction);
        newMoments.push(newestMoment);
      }
      return newMoments.map((newMoment) => [newMoment, newDistance]);
    },
  );
  controller.subbedMoments = subbedMoments;
}

export function useSchedulerController<TData, TResource>({
  initialViewEndDate,
  initialViewStartDate,
  clip,

  onSelect,
  determineSubMomentsCount: determineSubMomentsCountParam,

  determineDisplayUnit: determineDisplayUnitParam,
}: SchedulerControllerParams<TData, TResource>): SchedulerController<
  TData,
  TResource
> {
  const controller = useRef(
    proxy<SchedulerController<TData, TResource>>({
      calculateDistancePercentage: () => 0,
      displayUnit: "day",
      firstSelectedMoment: null,
      lastSelectedMoment: null,
      moments: [],
      momentWidths: [],

      subbedMoments: [],
      viewStartDate: dayjs().subtract(7, "days"),
      viewEndDate: dayjs().add(7, "days"),
      selectedMoments: {},
      selectedResourceId: null,
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
          // @ts-expect-error we only need key
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
          // @ts-expect-error we only need key
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
  }, [clip, controller, determineSubMomentsCountParam]);

  useEffect(() => {
    calculateSubMoments(controller, determineSubMomentsCountParam);
    const unsubscribe = subscribe(controller, (ops) => {
      if (
        !ops.find(
          // @ts-expect-error we only need key
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([op, key]) =>
            key[0] === "moments" ||
            key[0] === "momentWidths" ||
            key[0] === "displayUnit",
        )
      )
        return;
      calculateSubMoments(controller, determineSubMomentsCountParam);
    });
    return () => {
      unsubscribe();
    };
  }, [clip, controller, determineSubMomentsCountParam]);

  useSchedulerSelect(controller, onSelect);

  return controller;
}
