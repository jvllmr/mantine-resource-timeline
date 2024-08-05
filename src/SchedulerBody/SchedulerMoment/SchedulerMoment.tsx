import { MantineStyleProps, Paper, useMantineTheme } from "@mantine/core";
import { Dayjs } from "dayjs";
import { DragEvent, useContext, useMemo, useState } from "react";
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
}

export const SchedulerMoments = <TData, TResource>({
  resourceId,
  rowHeight,
  rowIndex,
  momentStyle,
  subMomentCount,
  resourcesCount,
}: SchedulerMomentsProps<TData, TResource>) => {
  const resource: TResource = useContext(resourceContext);
  const controller: SchedulerController<TData, TResource> =
    useControllerContext();
  const { momentDragEnd, momentDragStartOver } = controller;
  const firstMomentLoss = useMemo(
    () =>
      (controller.momentWidths[0] / 100) * (controller.momentWidths.length - 1),
    [controller.momentWidths],
  );

  const lastMomentLoss = useMemo(
    () =>
      (controller.momentWidths[controller.momentWidths.length - 1] / 100) *
      (controller.momentWidths.length - 1),
    [controller.momentWidths],
  );
  const theme = useMantineTheme();

  const [draggingEnabled, setDraggingEnabled] = useState(false);

  const zippedMoments = useMemo(
    () =>
      controller.moments.map((moment, index): [Dayjs, number] => [
        moment,
        controller.momentWidths[index],
      ]),
    [controller.momentWidths, controller.moments],
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
            controller.displayUnit,
          );
          for (let i = 1; i < subMomentCountWithLoss; i++) {
            newestMoment = newestMoment.add(...fraction);
            newMoments.push(newestMoment);
          }
          return newMoments.map((newMoment) => [newMoment, newDistance]);
        },
      ),
    [
      controller.displayUnit,
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
          controller.selectedResource == resource && // resource correct
          ((moment.isAfter(controller.firstSelectedMoment) &&
            nextMoment.isBefore(controller.lastSelectedMoment)) ||
            moment.isSame(controller.firstSelectedMoment) ||
            nextMoment.isSame(controller.lastSelectedMoment));
        const completeStyle = {
          ...momentStyle?.({
            moment,
            controller,
            theme,
            isSelected,
          }),
          borderTopWidth: rowIndex === 0 ? undefined : 0,
          borderRightWidth: 0,
          borderLeftWidth: momentIndex === 0 ? 0 : undefined,
          borderBottomWidth: rowIndex === resourcesCount - 1 ? 0 : undefined,
        };
        const onDragStartOver = momentDragStartOver?.(
          moment,
          nextMoment,
          resource,
        );
        const onDragEnd = momentDragEnd
          ? (event: DragEvent<HTMLDivElement>) => momentDragEnd(event, resource)
          : undefined;

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
          />
        );
      })}
    </>
  );
};
