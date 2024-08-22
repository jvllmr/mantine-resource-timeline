import { Box, MantineStyleProps, Paper } from "@mantine/core";
import { useMemo } from "react";
import {
  SchedulerBody,
  SchedulerBodyProps,
} from "../SchedulerBody/SchedulerBody";
import {
  SchedulerHeader,
  SchedulerHeaderProps,
} from "../SchedulerHeader/SchedulerHeader";
import { controllerContext } from "../controller/controller";
import gridClasses from "./SchedulerGrid.module.css";
export interface SchedulerProps<TData, TResource>
  extends Omit<SchedulerBodyProps<TData, TResource>, "rowHeight"> {
  width?: MantineStyleProps["w"];
  height?: MantineStyleProps["h"];
  rowHeight?: SchedulerBodyProps<TData, TResource>["rowHeight"];
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

export function Scheduler<TData, TResource>({
  height,
  width,

  headerOnClick,
  momentLabelComponent,
  stickyHeader,
  stickyHeaderOffset,

  ...props
}: SchedulerProps<TData, TResource>) {
  const rowHeight = useMemo(() => props.rowHeight ?? 60, [props.rowHeight]);

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
      <controllerContext.Provider value={props.controller}>
        <Box className={gridClasses.grid}>
          <SchedulerHeader
            controller={props.controller}
            onClick={headerOnClick}
            momentLabelComponent={momentLabelComponent}
            momentStyle={props.momentStyle}
            stickyHeader={stickyHeader}
            stickyHeaderOffset={stickyHeaderOffset}
          />

          <SchedulerBody {...props} rowHeight={rowHeight} />
        </Box>
      </controllerContext.Provider>
    </Paper>
  );
}

export default Scheduler;
