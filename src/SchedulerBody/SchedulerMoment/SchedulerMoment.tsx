import { MantineStyleProps, Paper, useMantineTheme } from "@mantine/core";
import { Dayjs } from "dayjs";
import { DragEvent, useContext, useMemo, useState } from "react";
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
}

const SchedulerMoment = <TData, TResource>({
  momentStyle,
  resourcesCount,
  momentIndex,
  draggingEnabled,
  setDraggingEnabled,
  distance,
  rowIndex,
  rowHeight,
  moment,
  resourceId,
}: SchedulerMomentsProps<TData, TResource> & {
  distance: number;

  moment: Dayjs;
  draggingEnabled: boolean;
  setDraggingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  momentIndex: number;
}) => {
  const resource: TResource = useContext(resourceContext);
  const controller = useControllerContext();
  const subbedMoments = useSnapshot(controller.subbedMoments);
  const { momentSelectClick, momentDragEnd, momentDragStartOver } =
    useSnapshot(controller);
  const selectSnap = useSnapshot(controller.selectedMoments);
  const isSelected = useMemo(
    () => !!selectSnap[resourceId]?.[moment.toISOString()]?.isSelected,
    [moment, resourceId, selectSnap],
  );
  const theme = useMantineTheme();
  const nextMoment = useMemo(
    () =>
      momentIndex + 1 < subbedMoments.length
        ? subbedMoments[momentIndex + 1][0]
        : moment,
    [moment, momentIndex, subbedMoments],
  );
  const onClick = useMemo(
    () => momentSelectClick?.(resource, moment, nextMoment),

    [moment, nextMoment, resource, momentSelectClick],
  );

  const onDragStartOver = useMemo(
    () => momentDragStartOver?.(moment, nextMoment, resourceId),

    [moment, momentDragStartOver, nextMoment, resourceId],
  );
  const onDragEnd = useMemo(
    () =>
      momentDragEnd
        ? (event: DragEvent<HTMLDivElement>) =>
            momentDragEnd?.(event, resource, resourceId)
        : undefined,

    [momentDragEnd, resource, resourceId],
  );
  const completeStyle = useMemo(
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
  ...props
}: SchedulerMomentsProps<TData, TResource>) => {
  const controller: SchedulerController<TData, TResource> =
    useControllerContext();
  const subbedMoments = useSnapshot(controller.subbedMoments);

  const [draggingEnabled, setDraggingEnabled] = useState(false);

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
            momentIndex={momentIndex}
          />
        );
      })}
    </>
  );
};
