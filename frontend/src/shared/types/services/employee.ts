export interface Employee {
  id: number;
  employee_no: string;
  employee_name: string;
  date_of_birth: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  employee_no: string;
  employee_name: string;
  date_of_birth: string;
  status: "active" | "inactive";
}

export interface UpdateEmployeeRequest {
  employee_no?: string;
  employee_name?: string;
  date_of_birth?: string;
  status?: "active" | "inactive";
}
