import { MantineStyleProps, Paper, useMantineTheme } from "@mantine/core";
import { DragEvent, useContext, useState } from "react";
import { useSnapshot } from "valtio";
import {
  SchedulerController,
  useControllerContext,
} from "../../controller/controller";
import { resourceContext } from "../contexts";
import classes from "./SchedulerMoment.module.css";
import { MomentStyleFn } from "./momentStyling";

export interface SchedulerMomentsProps<TData, TResource> {
  resourceId: string;
  rowIndex: number;
  rowHeight: MantineStyleProps["h"];
  momentStyle?: MomentStyleFn<TData, TResource>;
  resourcesCount: number;

  getResourceId: (resource: TResource) => string;
}

export const SchedulerMoments = <TData, TResource>({
  resourceId,
  rowHeight,
  rowIndex,
  momentStyle,

  resourcesCount,
  getResourceId,
}: SchedulerMomentsProps<TData, TResource>) => {
  const resource: TResource = useContext(resourceContext);
  const controller: SchedulerController<TData, TResource> =
    useControllerContext();
  const snap = useSnapshot(controller);

  const theme = useMantineTheme();

  const [draggingEnabled, setDraggingEnabled] = useState(false);

  return (
    <>
      {snap.subbedMoments.map(([moment, distance], momentIndex) => {
        const nextMoment =
          momentIndex + 1 < snap.subbedMoments.length
            ? snap.subbedMoments[momentIndex + 1][0]
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
