import { Box, MantineStyleProps, Tooltip } from "@mantine/core";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { UnknownSchedulerController } from "../controller/controller";

function getNow(tz?: string) {
  let now = dayjs();
  if (tz) {
    now = now.tz(tz);
  }

  return now;
}

export const NowMarkerController = React.memo(
  ({
    markerComponent,
    distanceCalculator,
    tz,
  }: {
    markerComponent: React.FC<NowMarkerProps>;
    distanceCalculator: UnknownSchedulerController["calculateDistancePercentage"];
    tz?: string;
  }) => {
    const Marker = markerComponent;
    const [now, setNow] = useState(getNow(tz));

    const nowLeft = useMemo(() => {
      const distance = distanceCalculator(now, "left");
      if (!distance) return undefined;
      return `${distance}%`;
    }, [distanceCalculator, now]);

    useEffect(() => {
      const timeout = setTimeout(() => setNow(getNow(tz)), 1000);

      return () => {
        clearTimeout(timeout);
      };
    });
    if (!nowLeft) return null;
    return <Marker left={nowLeft} now={now} />;
  },
  (prev, next) =>
    prev.markerComponent === next.markerComponent &&
    prev.distanceCalculator === next.distanceCalculator &&
    prev.tz === next.tz,
);

export interface NowMarkerProps {
  left: MantineStyleProps["left"];
  now: Dayjs;
}

export const DefaultNowMarker = React.memo(
  ({ left, now, format }: NowMarkerProps & { format?: string }) => {
    return (
      <Tooltip.Floating label={now.format(format)}>
        <Box pos="absolute" left={left} bg="yellow" h="100%" w={1} />
      </Tooltip.Floating>
    );
  },
);
