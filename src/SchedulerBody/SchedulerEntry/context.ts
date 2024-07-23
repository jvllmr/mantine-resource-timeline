import { createContext } from "react";
import {
  DefaultSchedulerEntry,
  SchedulerEntryComponent,
} from "./SchedulerEntry";

export const schedulerEntryContext = createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SchedulerEntryComponent<any, any>
>(DefaultSchedulerEntry);
