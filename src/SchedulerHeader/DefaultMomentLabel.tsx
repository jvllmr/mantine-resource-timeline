import { Box, Flex } from "@mantine/core";
import { Dayjs } from "dayjs";
import { useSnapshot } from "valtio";
import { SchedulerController } from "../controller/controller";

export type MomentLabelProps<TData, TResource> = {
  moment: Dayjs;
  controller: SchedulerController<TData, TResource>;
};

export function DefaultMomentLabel<TData, TResource>({
  controller,
  moment,
}: MomentLabelProps<TData, TResource>) {
  const snap = useSnapshot(controller);
  switch (snap.displayUnit) {
    case "year":
      return String(moment.year());
    case "month":
      return moment.format("MMMM");
    case "week":
      return String(moment.week());
    case "day":
      return (
        <Flex direction="column">
          <Box>{moment.format("dddd")}</Box>
          <Box>{moment.format("D MMMM")}</Box>
        </Flex>
      );
    case "hour":
      return moment.format("LT");
  }
}
