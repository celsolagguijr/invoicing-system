export interface Employee {
  id: number;
  employee_no: string;
  employee_name: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  name: string;
  owner: string;
  address1: string;
  address2: string;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TimelogTransaction {
  employee_id: number;
  customer_id: number;
  working_hours: number;
  ot_working_hours: number;
  date: string;
  remarks?: string | null;
}

export interface CreateTimelogRequest {
  transactions: TimelogTransaction[];
}

export interface CreateTimelogResponse {
  id: number;
  employee_id: number;
  customer_id: number;
  working_hours: number;
  ot_working_hours: number;
  date: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeTimelogReportQuery {
  start_date: string;
  end_date: string;
  employee_id?: number;
  client_id?: number;
}

export interface EmployeeTimelogReportItem {
  id: number;
  employee_id: number;
  customer_id: number;
  working_hours: number;
  ot_working_hours: number;
  date: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  employee: Employee;
  customer: Client;
}

export interface UpdateWorkingHoursRequest {
  working_hours: number;
  ot_working_hours: number;
  remarks?: string | null;
}
