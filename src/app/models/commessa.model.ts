export interface Commesse {
  id: number;
  title: string;
  date: Date;
  start: number;
  end: number;
  hours: number;
  maintenanceHours?: boolean;
  client?: string;
  project?: string;
  status: 'completed' | 'in-progress' | 'pending';
}
