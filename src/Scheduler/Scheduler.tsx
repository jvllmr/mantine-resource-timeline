import { Grid, MantineStyleProps, Paper } from "@mantine/core";
import { useMemo } from "react";
import {
  SchedulerBody,
  SchedulerBodyProps,
} from "../SchedulerBody/SchedulerBody";
import { SchedulerHeader, SchedulerHeaderProps } from "../SchedulerHeader";
import { controllerContext } from "../controller";
import { useDateAccessor } from "../utils";

export interface SchedulerProps<TData, TResource>
  extends Omit<SchedulerBodyProps<TData, TResource>, "rowHeight"> {
  width: MantineStyleProps["w"];
  height: MantineStyleProps["h"];
  rowHeight?: SchedulerBodyProps<TData, TResource>["rowHeight"];
  headerOnClick?: SchedulerHeaderProps["onClick"];
}

export function Scheduler<TData, TResource>({
  height,
  width,
  data,
  headerOnClick,
  ...props
}: SchedulerProps<TData, TResource>) {
  const getEndDate = useDateAccessor(props.endDateAccessor);
  const getStartDate = useDateAccessor(props.startDateAccessor);
  const relevantData = useMemo(
    () =>
      data.filter((item) => {
        const endDate = getEndDate(item);
        const startDate = getStartDate(item);

        return (
          (endDate.isBefore(props.controller.viewEndDate) &&
            endDate.isAfter(props.controller.viewStartDate)) ||
          (startDate.isAfter(props.controller.viewStartDate) &&
            startDate.isBefore(props.controller.viewEndDate)) ||
          endDate.isSame(props.controller.viewEndDate) ||
          startDate.isSame(props.controller.viewStartDate)
        );
      }),
    [
      data,
      getEndDate,
      getStartDate,
      props.controller.viewEndDate,
      props.controller.viewStartDate,
    ],
  );
  const rowHeight = useMemo(() => props.rowHeight ?? 60, [props.rowHeight]);

  return (
    <Paper withBorder w={width} mah={height}>
      <controllerContext.Provider value={props.controller}>
        <Grid gutter={0}>
          <SchedulerHeader
            controller={props.controller}
            onClick={headerOnClick}
          />

          <SchedulerBody {...props} data={relevantData} rowHeight={rowHeight} />
        </Grid>
      </controllerContext.Provider>
    </Paper>
  );
}

export default Scheduler;
