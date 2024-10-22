import { Dayjs } from "dayjs";
import { DragEvent, useEffect, useRef } from "react";
import { SchedulerController } from "./controller";
export type OnSelectFn<TData, TResource> = (params: {
  firstMoment: Dayjs;
  lastMoment: Dayjs;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}) => void;

export type SchedulerMomentOnDragStartOverFactory = (
  moment: Dayjs,
  nextMoment: Dayjs,
  resourceId: string,
) => (event: DragEvent<HTMLDivElement>) => void;
export type SchedulerMomentOnDragEndFn<TResource> = (
  event: DragEvent<HTMLDivElement>,
  resource: TResource,
  resourceId: string,
) => void;

export type SchedulerMomentSelectClickFnFactory<TResource> = (
  resource: TResource,
  moment: Dayjs,
  nextMoment: Dayjs,
) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

export const useSchedulerSelect = <TData, TResource>(
  controller: SchedulerController<TData, TResource>,
  onSelect?: OnSelectFn<TData, TResource>,
) => {
  const constantDiv = useRef(document.createElement("div")).current;

  useEffect(() => {
    controller.momentDragStartOver = onSelect
      ? (moment: Dayjs, nextMoment: Dayjs, resourceId: string) => (event) => {
          if (
            !event.ctrlKey &&
            (controller.selectedResourceId === resourceId ||
              controller.selectedResourceId === null)
          ) {
            event.dataTransfer.setDragImage(constantDiv, 0, 0);
            if (
              !controller.firstSelectedMoment ||
              moment.isBefore(controller.firstSelectedMoment)
            ) {
              controller.firstSelectedMoment = moment;
            } else if (!controller.lastSelectedMoment?.isSame(nextMoment)) {
              controller.lastSelectedMoment = nextMoment;
            }
            if (!controller.selectedResourceId) {
              controller.selectedResourceId = resourceId;
            }
            const selection = controller.selectedMoments[resourceId] ?? {};

            if (!controller.selectedMoments[resourceId]) {
              controller.selectedMoments[resourceId] = selection;
            }

            // mark as selected
            let isBetween = false;
            for (const [subMoment] of controller.subbedMoments) {
              if (subMoment.isSame(controller.firstSelectedMoment)) {
                isBetween = true;
              }
              if (subMoment.isSame(nextMoment)) {
                break;
              }
              if (
                isBetween &&
                !selection[subMoment.toISOString()]?.isSelected
              ) {
                selection[subMoment.toISOString()] = { isSelected: true };
              }
            }
          }
        }
      : undefined;
  }, [constantDiv, controller, onSelect]);

  useEffect(() => {
    controller.momentDragEnd = onSelect
      ? (event, resource, resourceId) => {
          event.preventDefault();
          if (
            !event.ctrlKey &&
            onSelect &&
            controller.firstSelectedMoment &&
            controller.lastSelectedMoment
          ) {
            onSelect({
              firstMoment: controller.firstSelectedMoment,
              lastMoment: controller.lastSelectedMoment,
              resource,
              controller,
            });

            controller.firstSelectedMoment = null;
            controller.lastSelectedMoment = null;
            controller.selectedMoments[resourceId] = {};
            controller.selectedResourceId = null;
          }
        }
      : undefined;
  }, [controller, onSelect]);
  useEffect(() => {
    controller.momentSelectClick = onSelect
      ? (resource, firstMoment, lastMoment) => (event) => {
          event.preventDefault();

          onSelect({
            controller,
            resource,
            firstMoment,
            lastMoment,
          });
        }
      : undefined;
  }, [controller, onSelect]);
};
