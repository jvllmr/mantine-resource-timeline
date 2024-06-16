import { Flex, MantineStyleProps, Paper } from "@mantine/core";
import { Dayjs } from "dayjs";
import React from "react";
import { SchedulerDisplayUnit } from "../../controller";

export interface SchedulerMomentProps {
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
  customDetermineSchedulerSubMomentsCount: (
    displayUnit: SchedulerDisplayUnit,
  ) => number;
  loss: number;
}

export const SchedulerMoment = React.memo((props: SchedulerMomentProps) => {
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
    >
      {props.inSub ? null : (
        <Flex>
          <SchedulerSubMoments {...props} />
        </Flex>
      )}
    </Paper>
  );
});

export const SchedulerSubMoments = React.memo((props: SchedulerMomentProps) => {
  const count = Math.ceil(
    props.customDetermineSchedulerSubMomentsCount(props.displayUnit) *
      props.loss,
  );

  if (!count) return null;
  const width = `${100 / count}%`;
  return [...new Array(count).keys()].map((n) => (
    <SchedulerMoment
      {...props}
      key={`${props.moment.toISOString()}_${props.resourceId}_${n}`}
      isTop
      isBottom
      isLeft={n === 0}
      isRight={n === count - 1}
      width={width}
      inSub
    />
  ));
});
