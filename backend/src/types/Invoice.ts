import { z } from "zod";
import {
  InvoiceCreateSchema,
  InvoiceIdParamSchema,
  InvoiceSearchQuerySchema,
  InvoiceUpdateSchema,
} from "../validators/InvoiceValidator";

export interface CreateInvoiceDetailRequest {
  employee_id: number;
  date: string;
  billed_hours: number;
  billed_ot_hours: number;
  remarks?: string | null;
}

export interface CreateInvoiceRequest {
  client_id: number;
  invoice_date?: string;
  due_date?: string;
  coverage_start?: string;
  coverage_end?: string;
}

export interface UpdateInvoiceDetailRequest {
  employee_id: number;
  date: string;
  billed_hours: number;
  billed_ot_hours: number;
  remarks?: string | null;
}

export interface UpdateInvoiceRequest {
  invoice_no?: string;
  client_id?: number;
  invoice_date?: string;
  due_date?: string;
  coverage_start?: string;
  coverage_end?: string;
  hourly_rate?: number;
  ot_hourly_rate?: number;
  total_working_hours?: number;
  total_amount?: number;
  invoice_details?: UpdateInvoiceDetailRequest[];
}

export interface AdjustmentRequest {
  id?: number;
  type: "ADDITIONAL" | "DEDUCTION";
  description: string;
  quantity: number;
  price: number;
  sort: number;
  is_deleted?: boolean;
}

export interface UpdateInvoiceAdjustmentsRequest {
  invoice_id: number;
  adjustments: AdjustmentRequest[];
}
export interface SearchInvoiceQueryRequest {
  invoice_no?: string;
  client_id?: string;
  invoice_date?: string;
  invoice_date_from?: string;
  invoice_date_to?: string;
}

export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof InvoiceUpdateSchema>;
export type InvoiceIdInput = z.infer<typeof InvoiceIdParamSchema>;
export type InvoiceSearchQueryInput = z.infer<typeof InvoiceSearchQuerySchema>;
