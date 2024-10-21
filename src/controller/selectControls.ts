import { Dayjs } from "dayjs";
import deepEqual from "fast-deep-equal";
import { DragEvent, useEffect, useRef } from "react";
import { snapshot } from "valtio";
import { SchedulerController } from "./controller";
export type OnSelectFn<TData, TResource> = (params: {
  firstMoment: Dayjs;
  lastMoment: Dayjs;
  controller: SchedulerController<TData, TResource>;
  resource: TResource;
}) => void;

export type SchedulerMomentOnDragStartOverFactory<TResource> = (
  moment: Dayjs,
  nextMoment: Dayjs,
  resource: TResource,
) => (event: DragEvent<HTMLDivElement>) => void;
export type SchedulerMomentOnDragEndFn<TResource> = (
  event: DragEvent<HTMLDivElement>,
  resource: TResource,
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
      ? (moment: Dayjs, nextMoment: Dayjs, resource: TResource) => (event) => {
          const selectedResource = controller.selectedResource
            ? snapshot(controller.selectedResource)
            : null;

          if (
            !event.ctrlKey &&
            (deepEqual(resource, selectedResource) || selectedResource === null)
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
            if (selectedResource !== resource) {
              controller.selectedResource = resource;
            }
          }
        }
      : undefined;
  }, [constantDiv, controller, onSelect]);

  useEffect(() => {
    controller.momentDragEnd = onSelect
      ? (event, resource) => {
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
            controller.selectedResource = null;
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
