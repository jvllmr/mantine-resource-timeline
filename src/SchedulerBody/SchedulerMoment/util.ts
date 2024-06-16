import { SchedulerController } from "../../controller";

export function determineSchedulerSubMomentsCount(
  controller: SchedulerController,
) {
  switch (controller.displayUnit) {
    case "year":
      return 12;
    case "month":
      return 4;
    case "week":
      return 7;
    case "day":
      return 4;
    case "hour":
      return 6;
  }
}
