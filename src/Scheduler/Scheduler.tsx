import { Box, MantineStyleProps, Paper, useProps } from "@mantine/core";
import {
  SchedulerBody,
  SchedulerBodyProps,
} from "../SchedulerBody/SchedulerBody";
import {
  SchedulerHeader,
  SchedulerHeaderProps,
} from "../SchedulerHeader/SchedulerHeader";

import gridClasses from "./SchedulerGrid.module.css";
export interface SchedulerProps<TData, TResource>
  extends Omit<
    SchedulerBodyProps<TData, TResource>,
    "rowHeight" | "gridLabelSize" | "totalGridSize"
  > {
  width?: MantineStyleProps["w"];
  height?: MantineStyleProps["h"];
  rowHeight?: SchedulerBodyProps<TData, TResource>["rowHeight"];
  gridLabelSize?: number;
  totalGridSize?: number;
  headerOnClick?: SchedulerHeaderProps<TData, TResource>["onClick"];
  momentLabelComponent?: SchedulerHeaderProps<
    TData,
    TResource
  >["momentLabelComponent"];
  stickyHeader?: SchedulerHeaderProps<TData, TResource>["stickyHeader"];
  stickyHeaderOffset?: SchedulerHeaderProps<
    TData,
    TResource
  >["stickyHeaderOffset"];
}

const defaultProps = {
  rowHeight: 60,
  gridLabelSize: 2,
  totalGridSize: 16,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Partial<SchedulerProps<any, any>>;

export function Scheduler<TData, TResource>(
  inputProps: SchedulerProps<TData, TResource>,
) {
  const {
    height,
    width,

    headerOnClick,
    momentLabelComponent,
    stickyHeader,
    stickyHeaderOffset,

    ...props
  }: SchedulerProps<TData, TResource> & typeof defaultProps = useProps(
    "Scheduler",
    defaultProps,
    inputProps,
  );

  return (
    <Paper
      withBorder
      w={width}
      mah={height}
      style={{
        // establish a local stacking context
        zIndex: 0,
      }}
    >
      <Box
        className={gridClasses.grid}
        style={{
          "--mantine-scheduler-grid-repeat": `repeat(${props.totalGridSize}, 1fr)`,
        }}
      >
        <SchedulerHeader
          controller={props.controller}
          onClick={headerOnClick}
          momentLabelComponent={momentLabelComponent}
          momentStyle={props.momentStyle}
          stickyHeader={stickyHeader}
          stickyHeaderOffset={stickyHeaderOffset}
          totalGridSize={props.totalGridSize}
          gridLabelSize={props.gridLabelSize}
        />

        <SchedulerBody {...props} />
      </Box>
    </Paper>
  );
}

export default Scheduler;
