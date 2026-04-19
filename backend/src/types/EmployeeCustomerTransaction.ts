import { z } from "zod";
import {
  EmployeeCustomerTransactionCreateSchema,
  EmployeeCustomerTransactionBatchCreateSchema,
  EmployeeCustomerTransactionUpdateSchema,
  EmployeeCustomerTransactionIdParamSchema,
  EmployeeCustomerTransactionDateRangeQuerySchema,
} from "../validators/EmployeeCustomerTransactionValidator";

export interface CreateEmployeeCustomerTransactionRequest {
  employee_id: number;
  customer_id: number;
  working_hours: number;
  ot_working_hours: number;
  date: string;
  remarks?: string | null;
}

export interface CreateEmployeeCustomerTransactionBatchRequest {
  transactions: CreateEmployeeCustomerTransactionRequest[];
}

export interface UpdateEmployeeCustomerTransactionRequest {
  employee_id?: number;
  customer_id?: number;
  working_hours?: number;
  ot_working_hours?: number;
  date?: string;
  remarks?: string | null;
}

export interface EmployeeCustomerTransactionDateRangeQueryRequest {
  start_date: string;
  end_date: string;
  employee_id?: number;
  client_id?: number;
}

// Zod-inferred types
export type EmployeeCustomerTransactionCreateInput = z.infer<
  typeof EmployeeCustomerTransactionCreateSchema
>;
export type EmployeeCustomerTransactionBatchCreateInput = z.infer<
  typeof EmployeeCustomerTransactionBatchCreateSchema
>;
export type EmployeeCustomerTransactionUpdateInput = z.infer<
  typeof EmployeeCustomerTransactionUpdateSchema
>;
export type EmployeeCustomerTransactionIdInput = z.infer<
  typeof EmployeeCustomerTransactionIdParamSchema
>;
export type EmployeeCustomerTransactionDateRangeQueryInput = z.infer<
  typeof EmployeeCustomerTransactionDateRangeQuerySchema
>;
