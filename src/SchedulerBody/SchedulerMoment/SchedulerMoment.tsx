import { MantineStyleProps, Paper, useMantineTheme } from "@mantine/core";
import { Dayjs } from "dayjs";
import { DragEvent, useContext, useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import {
  SchedulerController,
  useControllerContext,
} from "../../controller/controller";
import { timeFraction } from "../../utils";
import { resourceContext } from "../contexts";
import classes from "./SchedulerMoment.module.css";
import { MomentStyleFn } from "./momentStyling";

export interface SchedulerMomentsProps<TData, TResource> {
  resourceId: string;
  rowIndex: number;
  rowHeight: MantineStyleProps["h"];
  momentStyle?: MomentStyleFn<TData, TResource>;
  resourcesCount: number;
  subMomentCount: number;
  getResourceId: (resource: TResource) => string;
}

export const SchedulerMoments = <TData, TResource>({
  resourceId,
  rowHeight,
  rowIndex,
  momentStyle,
  subMomentCount,
  resourcesCount,
  getResourceId,
}: SchedulerMomentsProps<TData, TResource>) => {
  const resource: TResource = useContext(resourceContext);
  const controller: SchedulerController<TData, TResource> =
    useControllerContext();
  const snap = useSnapshot(controller);

  const firstMomentLoss = useMemo(
    () => (snap.momentWidths[0] / 100) * (snap.momentWidths.length - 1),
    [snap.momentWidths],
  );

  const lastMomentLoss = useMemo(
    () =>
      (snap.momentWidths[snap.momentWidths.length - 1] / 100) *
      (snap.momentWidths.length - 1),
    [snap.momentWidths],
  );
  const theme = useMantineTheme();

  const [draggingEnabled, setDraggingEnabled] = useState(false);

  const zippedMoments = useMemo(
    () =>
      snap.moments.map((moment, index): [Dayjs, number] => [
        moment,
        snap.momentWidths[index],
      ]),
    [snap.momentWidths, snap.moments],
  );
  const subbedMoments = useMemo(
    () =>
      zippedMoments.flatMap(
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
            snap.displayUnit,
          );
          for (let i = 1; i < subMomentCountWithLoss; i++) {
            newestMoment = newestMoment.add(...fraction);
            newMoments.push(newestMoment);
          }
          return newMoments.map((newMoment) => [newMoment, newDistance]);
        },
      ),
    [
      snap.displayUnit,
      firstMomentLoss,
      lastMomentLoss,
      subMomentCount,
      zippedMoments,
    ],
  );
  return (
    <>
      {subbedMoments.map(([moment, distance], momentIndex) => {
        const nextMoment =
          momentIndex + 1 < subbedMoments.length
            ? subbedMoments[momentIndex + 1][0]
            : moment;
        const isSelected =
          !!snap.selectedResource &&
          // @ts-expect-error unrelated generic or something...
          getResourceId(snap.selectedResource) === getResourceId(resource) && // resource correct
          ((moment.isAfter(snap.firstSelectedMoment) &&
            nextMoment.isBefore(snap.lastSelectedMoment)) ||
            moment.isSame(snap.firstSelectedMoment) ||
            nextMoment.isSame(snap.lastSelectedMoment));

        const completeStyle = {
          ...momentStyle?.({
            moment,
            controller,
            theme,
            isSelected,
          }),
          borderTopWidth: rowIndex === 0 ? undefined : 0,
          borderRightWidth: 0,

          borderBottomWidth: rowIndex === resourcesCount - 1 ? 0 : undefined,
        };
        const onDragStartOver = snap.momentDragStartOver?.(
          moment,
          nextMoment,
          resource,
        );
        const onDragEnd = snap.momentDragEnd
          ? (event: DragEvent<HTMLDivElement>) =>
              snap.momentDragEnd?.(event, resource)
          : undefined;

        const onClick = snap.momentSelectClick?.(resource, moment, nextMoment);

        return (
          <Paper
            key={`moment_${resourceId}_${momentIndex}`}
            radius={0}
            w={`${distance}%`}
            h={rowHeight}
            withBorder
            style={completeStyle}
            className={classes.schedulerMoment}
            data-selected={isSelected}
            onDragEnd={onDragEnd}
            onDragOver={onDragStartOver}
            onDragStart={onDragStartOver}
            onMouseDown={() => {
              setDraggingEnabled(true);
            }}
            onMouseUp={() => setDraggingEnabled(false)}
            draggable={draggingEnabled && !!(onDragEnd && onDragStartOver)}
            onClick={onClick}
          />
        );
      })}
    </>
  );
};
