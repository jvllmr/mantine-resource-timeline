import { Box, Flex, MantineStyleProps, Paper } from "@mantine/core";
import { Dayjs } from "dayjs";
import React, { useMemo, useRef } from "react";
import {
  SchedulerController,
  SchedulerDisplayUnit,
  useControllerContext,
} from "../controller/controller";
import gridClasses from "../Scheduler/SchedulerGrid.module.css";
import {
  DataFieldAccessor,
  useDateAccessor,
  useStringAccessor,
  useStringArrayAccessor,
} from "../utils";
import { resourceContext } from "./contexts";
import {
  DefaultNowMarker,
  NowMarkerController,
  NowMarkerProps,
} from "./NowMarker";
import { DefaultResourceLabel, ResourceLabelProps } from "./ResourceLabel";
import { schedulerEntryContext } from "./SchedulerEntry/context";
import {
  DefaultSchedulerEntry,
  SchedulerEntryProps,
  SchedulerEntryRenderer,
} from "./SchedulerEntry/SchedulerEntry";
import { MomentStyleFn } from "./SchedulerMoment/momentStyling";
import { SchedulerMoments } from "./SchedulerMoment/SchedulerMoment";
export type DetermineSubMomentCountsFn = (
  displayUnit: SchedulerDisplayUnit,
) => number;
export interface SchedulerBodyProps<TData, TResource> {
  startDate?: Date;
  endDate?: Date;
  data: TData[];
  resources: TResource[];
  startDateAccessor: DataFieldAccessor<TData, Dayjs>;
  endDateAccessor: DataFieldAccessor<TData, Dayjs>;
  dataIdAccessor: DataFieldAccessor<TData, string | number>;
  dataResourceIdAccessor: DataFieldAccessor<TData, string | number>;
  resourceIdAccessor: DataFieldAccessor<TResource, string | number>;
  controller: SchedulerController<TData, TResource>;
  rowHeight: NonNullable<MantineStyleProps["h"]>;
  resourceLabelComponent?: React.FC<ResourceLabelProps<TResource>>;
  entryComponent?: React.FC<SchedulerEntryProps<TData, TResource>>;
  nowMarkerComponent?: React.FC<NowMarkerProps>;
  determineSubMomentCounts?: DetermineSubMomentCountsFn;
  momentStyle?: MomentStyleFn<TData, TResource>;
}

function SchedulerBodyRow<TData, TResource>({
  data,
  customNowMarker,

  getDataResourceId,
  resourceId,
  getEndDate,
  getStartDate,
  resourcesCount,
  rowHeight,
  rowIndex,
  momentStyle,
  subMomentCount,
  dataIdAccessor,
}: {
  data: TData[];
  resourcesCount: number;
  customNowMarker: NonNullable<
    SchedulerBodyProps<TData, TResource>["nowMarkerComponent"]
  >;
  dataIdAccessor: DataFieldAccessor<TData, string | number>;
  getDataResourceId: (dataItem: TData) => string[];
  getEndDate: (dataItem: TData) => Dayjs;
  getStartDate: (dataItem: TData) => Dayjs;
  resourceId: string;
  entryComponent: NonNullable<
    SchedulerBodyProps<TData, TResource>["entryComponent"]
  >;

  rowHeight: SchedulerBodyProps<TData, TResource>["rowHeight"];

  rowIndex: number;
  subMomentCount: number;
  momentStyle?: MomentStyleFn<TData, TResource>;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const controller = useControllerContext();
  const getDataId = useStringAccessor(dataIdAccessor);

  const filteredData = useMemo(
    () => data.filter((item) => getDataResourceId(item).includes(resourceId)),
    [data, getDataResourceId, resourceId],
  );
  return (
    <Flex pos="relative" ref={rowRef} style={{ touchAction: "none" }}>
      <NowMarkerController
        distanceCalculator={controller.calculateDistancePercentage}
        markerComponent={customNowMarker}
      />

      {filteredData.map((item) => {
        const startDate = getStartDate(item);
        const endDate = getEndDate(item);
        const startDistance = controller.calculateDistancePercentage(
          startDate,
          "left",
        );
        const endDistance = controller.calculateDistancePercentage(
          endDate,
          "right",
        );
        const isOverlap =
          controller.viewStartDate.isBefore(endDate) &&
          controller.viewEndDate.isAfter(startDate);
        const display: MantineStyleProps["display"] = isOverlap
          ? undefined
          : "none";
        const entryId = getDataId(item);

        return (
          <SchedulerEntryRenderer
            key={`entry_${entryId}`}
            pos="absolute"
            data={item}
            top="10%"
            left={`${startDistance}%`}
            h="80%"
            right={`${endDistance}%`}
            display={display}
          />
        );
      })}

      <SchedulerMoments
        key="scheduler_moments"
        resourceId={resourceId}
        resourcesCount={resourcesCount}
        rowHeight={rowHeight}
        rowIndex={rowIndex}
        momentStyle={momentStyle}
        subMomentCount={subMomentCount}
      />
    </Flex>
  );
}

export function SchedulerBody<TData, TResource>({
  resources,
  resourceIdAccessor: resourceIdField,
  data,
  dataResourceIdAccessor: dataResourceIdField,
  endDateAccessor: endDateField,
  startDateAccessor: startDateField,
  resourceLabelComponent,
  entryComponent,
  nowMarkerComponent,
  determineSubMomentCounts,
  rowHeight,
  momentStyle,
  dataIdAccessor,
}: SchedulerBodyProps<TData, TResource>) {
  const controller = useControllerContext();
  const getResourceId = useStringAccessor(resourceIdField);
  const getDataResourceId = useStringArrayAccessor(dataResourceIdField);
  const getStartDate = useDateAccessor(startDateField);
  const getEndDate = useDateAccessor(endDateField);

  const CustomResourceLabel = useMemo(
    () => resourceLabelComponent ?? DefaultResourceLabel,
    [resourceLabelComponent],
  );
  const customSchedulerEntry = useMemo(
    () => entryComponent ?? DefaultSchedulerEntry,
    [entryComponent],
  );
  const customNowMarker = useMemo(
    () => nowMarkerComponent ?? DefaultNowMarker,
    [nowMarkerComponent],
  );

  const subMomentCount = useMemo(
    () => determineSubMomentCounts?.(controller.displayUnit) ?? 0,
    [controller.displayUnit, determineSubMomentCounts],
  );

  return (
    <Box className={gridClasses.subGrid}>
      <schedulerEntryContext.Provider value={customSchedulerEntry}>
        {resources.map((resource, rowIndex) => {
          const resourceId = getResourceId(resource);
          return (
            <resourceContext.Provider
              key={`resource_row_${resourceId}`}
              value={resource}
            >
              <Box className={gridClasses.resourceLabels}>
                <Paper
                  withBorder
                  radius={0}
                  w="100%"
                  mah={rowHeight}
                  style={{
                    borderLeftWidth: 0,
                    borderBottomWidth: 0,
                    borderRightWidth: 0,
                  }}
                >
                  <CustomResourceLabel
                    resource={resource}
                    getResourceId={getResourceId}
                  />
                </Paper>
              </Box>
              <Box className={gridClasses.mainBody}>
                <SchedulerBodyRow
                  key={`row_content_${resourceId}`}
                  rowIndex={rowIndex}
                  customNowMarker={customNowMarker}
                  data={data}
                  entryComponent={customSchedulerEntry}
                  getDataResourceId={getDataResourceId}
                  getEndDate={getEndDate}
                  getStartDate={getStartDate}
                  resourceId={resourceId}
                  rowHeight={rowHeight}
                  momentStyle={momentStyle}
                  resourcesCount={resources.length}
                  subMomentCount={subMomentCount}
                  dataIdAccessor={dataIdAccessor}
                />
              </Box>
            </resourceContext.Provider>
          );
        })}
      </schedulerEntryContext.Provider>
    </Box>
  );
}
