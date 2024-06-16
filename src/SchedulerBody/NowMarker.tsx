import { Box, MantineStyleProps, Tooltip } from "@mantine/core";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { SchedulerController } from "../controller";

export function NowMarkerController({
  markerComponent,
  distanceCalculator,
}: {
  markerComponent: React.FC<NowMarkerProps>;
  distanceCalculator: SchedulerController["calculateDistancePercentage"];
}) {
  const Marker = markerComponent;
  const [now, setNow] = useState(dayjs());

  const nowLeft = useMemo(() => {
    const distance = distanceCalculator(dayjs(), "left");
    if (!distance) return undefined;
    return `${distance}%`;
  }, [distanceCalculator]);

  useEffect(() => {
    const timeout = setTimeout(() => setNow(dayjs()), 1000);

    return () => {
      clearTimeout(timeout);
    };
  });

  return <Marker left={nowLeft} now={now} />;
}

export interface NowMarkerProps {
  left: MantineStyleProps["left"];
  now: Dayjs;
}

export const NowMarker = React.memo(({ left, now }: NowMarkerProps) => {
  if (!left) return null;
  return (
    <Tooltip.Floating label={now.toString()}>
      <Box pos="absolute" left={left} bg="yellow" h="100%" w={1} />
    </Tooltip.Floating>
  );
});
