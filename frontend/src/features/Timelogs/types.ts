export interface PendingEntry {
  key?: string;
  employee_id: number;
  customer_id: number;
  customer_name?: string;
  working_hours: number;
  ot_working_hours: number;
  date: string;
  remarks?: string;
}

export interface EditingEntry {
  employee_id: number;
  customer_id?: number;
  customer_name?: string;
  working_hours?: number;
  ot_working_hours?: number;
  date: string;
  remarks?: string;
}
