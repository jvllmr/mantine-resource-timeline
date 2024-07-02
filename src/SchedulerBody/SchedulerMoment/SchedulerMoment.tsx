import { Flex, MantineStyleProps, Paper } from "@mantine/core";
import { Dayjs } from "dayjs";
import React, { DragEvent, useContext } from "react";
import { SchedulerDisplayUnit } from "../../controller/controller";
import {
  SchedulerMomentOnDragEndFn,
  SchedulerMomentOnDragStartOverFactory,
  SelectedMoments,
} from "../../controller/selectControls";
import { timeFraction } from "../../utils";
import { resourceContext } from "../contexts";
import classes from "./SchedulerMoment.module.css";
export interface SchedulerMomentProps<TResource> {
  width: string;
  height: MantineStyleProps["h"];
  isTop: boolean;
  isBottom: boolean;
  isRight: boolean;
  isLeft: boolean;
  moment: Dayjs;
  resourceId: string;
  displayUnit: SchedulerDisplayUnit;
  inSub?: boolean;
  subMomentCount: number;
  loss: number;
  onDragEnd?: SchedulerMomentOnDragEndFn<TResource>;
  onDragStartOverFactory?: SchedulerMomentOnDragStartOverFactory<TResource>;
  selectedMoments: SelectedMoments;
  selectedResource: TResource | null;
  isSelected?: boolean;
}

export const SchedulerMoment = React.memo(
  (props: SchedulerMomentProps<unknown>) => {
    const resource = useContext(resourceContext);
    const onDragEnd =
      props.inSub && props.onDragEnd
        ? (event: DragEvent<HTMLDivElement>) =>
            props.onDragEnd?.(event, resource)
        : undefined;
    const onDragStartOver = props.inSub
      ? props.onDragStartOverFactory?.(props.moment, resource)
      : undefined;

    return (
      <Paper
        key={`${props.moment.toISOString()}_${props.resourceId}`}
        radius={0}
        withBorder
        h={props.height}
        w={props.width}
        style={{
          borderTopWidth: props.isTop && props.inSub ? undefined : 0,
          borderRightWidth: 0,
          borderLeftWidth: props.isLeft ? 0 : undefined,
          borderBottomWidth: props.isBottom && !props.inSub ? undefined : 0,
        }}
        onDragStart={onDragStartOver}
        onDragOver={onDragStartOver}
        onDragEnd={onDragEnd}
        draggable={!!(onDragEnd && onDragStartOver)}
        className={classes.schedulerMoment}
        data-selected={props.isSelected && props.selectedResource == resource}
      >
        {props.inSub ? null : (
          <Flex>
            <SchedulerSubMoments {...props} />
          </Flex>
        )}
      </Paper>
    );
  },
);

export const SchedulerSubMoments = React.memo(
  (props: SchedulerMomentProps<unknown>) => {
    const count = Math.ceil(props.subMomentCount * props.loss);
    if (!count) return null;

    const width = `${100 / count}%`;
    return [...new Array(count).keys()].map((n) => {
      const fraction = timeFraction(count, props.displayUnit);
      const myMoment = props.moment.add(fraction[0] * n, fraction[1]);

      return (
        <SchedulerMoment
          {...props}
          key={myMoment.toISOString()}
          isTop
          isBottom
          isLeft={n === 0}
          isRight={n === count - 1}
          width={width}
          inSub
          moment={myMoment}
          isSelected={
            !!props.selectedMoments.find((selected) =>
              selected.isSame(myMoment),
            )
          }
        />
      );
    });
  },
);
