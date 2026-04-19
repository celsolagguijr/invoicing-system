import { z } from "zod";
import {
  EmployeeCreateSchema,
  EmployeeUpdateSchema,
  EmployeeIdParamSchema,
} from "../validators/EmployeeValidator";

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

// Zod-inferred types (recommended)
export type EmployeeCreateInput = z.infer<typeof EmployeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof EmployeeUpdateSchema>;
export type EmployeeIdInput = z.infer<typeof EmployeeIdParamSchema>;
