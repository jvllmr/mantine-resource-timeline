import { Flex, MantineStyleProps, Paper, useMantineTheme } from "@mantine/core";
import { Dayjs } from "dayjs";
import { DragEvent, useContext, useMemo } from "react";
import {
  SchedulerDisplayUnit,
  useControllerContext,
} from "../../controller/controller";
import {
  SchedulerMomentOnDragEndFn,
  SchedulerMomentOnDragStartOverFactory,
  SelectedMoments,
} from "../../controller/selectControls";
import { timeFraction } from "../../utils";
import { resourceContext } from "../contexts";
import classes from "./SchedulerMoment.module.css";
import { MomentStyleFn } from "./momentStyling";
export interface SchedulerMomentProps<TData, TResource> {
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
  momentStyle?: MomentStyleFn<TData, TResource>;
}

export const SchedulerMoment = <TData, TResource>(
  props: SchedulerMomentProps<TData, TResource>,
) => {
  // @ts-expect-error context cannot know generic
  const resource: TResource = useContext(resourceContext);
  const controller = useControllerContext();
  const onDragEnd = useMemo(
    () =>
      props.inSub && props.onDragEnd
        ? (event: DragEvent<HTMLDivElement>) =>
            props.onDragEnd?.(event, resource)
        : undefined,
    [props, resource],
  );
  const onDragStartOver = useMemo(
    () =>
      props.inSub
        ? props.onDragStartOverFactory?.(props.moment, resource)
        : undefined,
    [props, resource],
  );
  const theme = useMantineTheme();
  const isSelected = useMemo(
    () => props.isSelected && props.selectedResource == resource,
    [props.isSelected, props.selectedResource, resource],
  );
  const completeStyle = useMemo(
    () => ({
      ...props.momentStyle?.({
        moment: props.moment,
        controller,
        theme,
        isSelected,
      }),
      borderTopWidth: props.isTop && props.inSub ? undefined : 0,
      borderRightWidth: 0,
      borderLeftWidth: props.isLeft ? 0 : undefined,
      borderBottomWidth: props.isBottom && !props.inSub ? undefined : 0,
    }),
    [controller, isSelected, props, theme],
  );
  return useMemo(
    () => (
      <Paper
        key={`${props.moment.toISOString()}_${props.resourceId}`}
        radius={0}
        withBorder
        h={props.height}
        w={props.width}
        style={completeStyle}
        onDragStart={onDragStartOver}
        onDragOver={onDragStartOver}
        onDragEnd={onDragEnd}
        draggable={!!(onDragEnd && onDragStartOver)}
        className={classes.schedulerMoment}
        data-selected={isSelected}
      >
        {props.inSub ? null : (
          <Flex>
            <SchedulerSubMoments {...props} />
          </Flex>
        )}
      </Paper>
    ),
    [completeStyle, isSelected, onDragEnd, onDragStartOver, props],
  );
};

export const SchedulerSubMoments = <TData, TResource>(
  props: SchedulerMomentProps<TData, TResource>,
) => {
  const count = Math.ceil(props.subMomentCount * props.loss);
  if (!count) return null;

  const width = `${100 / count}%`;
  return [...new Array(count).keys()].map((n) => {
    const fraction = timeFraction(count, props.displayUnit);
    const myMoment = props.moment.add(fraction[0] * n, fraction[1]);

    return (
      <SchedulerMoment
        {...props}
        key={`sub_${myMoment.toISOString()}_${props.resourceId}`}
        isTop
        isBottom
        isLeft={n === 0}
        isRight={n === count - 1}
        width={width}
        inSub
        moment={myMoment}
        isSelected={
          !!props.selectedMoments.find((selected) => selected.isSame(myMoment))
        }
      />
    );
  });
};
