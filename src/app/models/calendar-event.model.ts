import { EventAction, EventColor } from "calendar-utils";

export interface ExtendedCalendarEvent<MetaType = any> {
  id?: string | number;
  start: Date;
  end?: Date;
  title: string;
  color?: EventColor;
  actions?: EventAction[];
  allDay?: boolean;
  cssClass?: string;
  resizable?: {
    beforeStart?: boolean;
    afterEnd?: boolean;
  };
  draggable?: boolean;
  meta?: MetaType;
  hours?: number;
  minhours?: number;
  maxHours?: number;
  maintenanceHours?: boolean;
  status?: string,
  client?: string,
  project?: string
}
