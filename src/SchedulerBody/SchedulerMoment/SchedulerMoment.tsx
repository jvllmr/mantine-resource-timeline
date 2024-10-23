import {
  CSSProperties,
  MantineStyleProp,
  Paper,
  useMantineTheme,
} from "@mantine/core";
import { Dayjs } from "dayjs";
import { DragEvent, useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import { SchedulerController } from "../../controller/controller";

import classes from "./SchedulerMoment.module.css";
import { MomentStyleFn } from "./momentStyling";

export interface SchedulerMomentsProps<TData, TResource> {
  resourceId: string;
  rowIndex: number;
  rowHeight: CSSProperties["height"];
  momentStyle?: MomentStyleFn<TData, TResource>;
  resourcesCount: number;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}

const SchedulerMoment = <TData, TResource>({
  momentStyle,
  resourcesCount,
  nextMoment,
  draggingEnabled,
  setDraggingEnabled,
  distance,
  rowIndex,
  rowHeight,
  moment,
  resourceId,
  controller,
  resource,
  onDragEnd,
}: SchedulerMomentsProps<TData, TResource> & {
  distance: number;

  moment: Dayjs;
  draggingEnabled: boolean;
  setDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  nextMoment: Dayjs;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
}) => {
  const { momentSelectClick, momentDragStartOver } = useSnapshot(controller);
  const selectSnap = useSnapshot(controller.selectedMoments);
  const isSelected = useMemo(
    () => !!selectSnap[resourceId]?.[moment.toISOString()]?.isSelected,
    [moment, resourceId, selectSnap],
  );
  const theme = useMantineTheme();

  const onClick = useMemo(
    () => momentSelectClick?.(resource, moment, nextMoment),
    [moment, nextMoment, resource, momentSelectClick],
  );

  const onDragStartOver = useMemo(
    () => momentDragStartOver?.(moment, nextMoment, resourceId),

    [moment, momentDragStartOver, nextMoment, resourceId],
  );

  const completeStyle: MantineStyleProp = useMemo(
    () => ({
      ...momentStyle?.({
        moment,
        controller,
        theme,
        isSelected,
      }),
      borderTopWidth: rowIndex === 0 ? undefined : 0,
      borderRightWidth: 0,

      borderBottomWidth: rowIndex === resourcesCount - 1 ? 0 : undefined,
    }),
    [
      controller,
      isSelected,
      moment,
      momentStyle,
      resourcesCount,
      rowIndex,
      theme,
    ],
  );

  return (
    <Paper
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
};

export const SchedulerMoments = <TData, TResource>({
  controller,

  ...props
}: SchedulerMomentsProps<TData, TResource>) => {
  const subbedMoments = useSnapshot(controller.subbedMoments);
  const { momentDragEnd } = useSnapshot(controller);
  const [draggingEnabled, setDraggingEnabled] = useState(false);

  const onDragEnd = useMemo(
    () =>
      momentDragEnd
        ? (event: DragEvent<HTMLDivElement>) =>
            momentDragEnd?.(event, props.resource, props.resourceId)
        : undefined,

    [momentDragEnd, props.resource, props.resourceId],
  );

  return (
    <>
      {subbedMoments.map(([moment, distance], momentIndex) => {
        return (
          <SchedulerMoment
            key={`moment_${props.resourceId}_${momentIndex}`}
            {...props}
            distance={distance}
            draggingEnabled={draggingEnabled}
            setDraggingEnabled={setDraggingEnabled}
            moment={moment}
            nextMoment={
              momentIndex + 1 < subbedMoments.length
                ? subbedMoments[momentIndex + 1][0]
                : moment
            }
            controller={controller}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </>
  );
};
