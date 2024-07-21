import { MantineStyleProp, MantineTheme } from "@mantine/core";
import { Dayjs } from "dayjs";
import { SchedulerController } from "../../controller/controller";

export type MomentStyleFn<TData, TResource> = (params: {
  moment: Dayjs;
  controller: SchedulerController<TData, TResource>;
  theme: MantineTheme;
  isSelected?: boolean;
}) => MantineStyleProp | undefined;
