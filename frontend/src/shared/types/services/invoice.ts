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
  total_amount: number;
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

export interface InvoiceDetails extends InvoiceItem {
  created_at: string;
  updated_at: string;
  invoice_details: InvoiceDetailItem[];
}

export interface SearchInvoiceParams {
  invoice_no?: string;
  client_id?: number;
  invoice_date?: string;
  invoice_date_from?: string;
  invoice_date_to?: string;
}

export interface CreateInvoiceRequest {
  client_id: number;
  invoice_date?: string;
  due_date?: string;
  coverage_start: string;
  coverage_end: string;
}
