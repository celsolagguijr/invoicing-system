export interface InvoiceClient {
  id: number;
  name: string;
  owner: string;
  address1: string;
  address2: string | null;
  hourly_rate: number;
  ot_hourly_rate: number;
}

export interface InvoiceItem {
  id: number;
  invoice_no: string;
  client_id: number;
  invoice_date: string;
  due_date: string;
  coverage_start: string;
  coverage_end: string;
  hourly_rate: number;
  ot_hourly_rate: number;
  total_working_hours: number;
  total_ot_working_hours: number;
  total_amount: number;
  total_additions: number;
  total_deductions: number;
  grant_total: number;
  client: InvoiceClient;
}

export interface InvoiceDetailEmployee {
  id: number;
  employee_no: string;
  employee_name: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDetailItem {
  id: number;
  invoice_id: number;
  client_id: number;
  employee_id: number;
  date: string;
  billed_hours: number;
  billed_ot_hours: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  employee: InvoiceDetailEmployee;
}

export interface InvoiceAdjustment {
  id: number;
  type: "ADDITIONAL" | "DEDUCTION";
  invoice_id: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
  sort: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceDetails extends InvoiceItem {
  created_at: string;
  updated_at: string;
  invoice_details: InvoiceDetailItem[];
  invoice_adjustments: InvoiceAdjustment[];
}

export interface SearchInvoiceParams {
  invoice_no?: string;
  client_id?: number;
  invoice_date?: string;
  invoice_date_from?: string;
  invoice_date_to?: string;
}

export interface InvoiceAdjustmentTableDetails {
  id?: number;
  invoiceId: number;
  rowKey: string;
  type: "ADDITIONAL" | "DEDUCTION";
  description: string;
  quantity: number;
  price: number;
  sort: number;
  isDeleted: boolean;
}

export interface AdjustmentDetails {
  id?: number;
  type: "ADDITIONAL" | "DEDUCTION";
  description: string;
  quantity: number;
  price: number;
  sort: number;
  is_deleted: boolean;
}

export interface InvoiceAdjustmentRequest {
  invoice_id: number;
  adjustments: AdjustmentDetails[];
}

export interface CreateInvoiceRequest {
  client_id: number;
  invoice_date?: string;
  due_date?: string;
  coverage_start: string;
  coverage_end: string;
}
