import { Response } from "@app/shared/types";
import AuthService from "./AuthService";
import axios from "@app/shared/utils/axios";
import type {
  InvoiceItem,
  InvoiceDetails,
  SearchInvoiceParams,
  CreateInvoiceRequest,
} from "@app/shared/types/services/invoice";

export type {
  InvoiceClient,
  InvoiceItem,
  InvoiceDetailEmployee,
  InvoiceDetailItem,
  InvoiceDetails,
  SearchInvoiceParams,
  CreateInvoiceRequest,
} from "@app/shared/types/services/invoice";

class InvoiceService {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async searchInvoices(
    params: SearchInvoiceParams
  ): Promise<Response<InvoiceItem[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;

    const response = await axios.get(`/invoices/search`, {
      params,
    });

    return response.data;
  }

  async createInvoice(
    data: CreateInvoiceRequest
  ): Promise<Response<InvoiceItem>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;

    const response = await axios.post(`/invoices`, data);
    return response.data;
  }

  async getInvoiceById(id: number): Promise<Response<InvoiceDetails>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;

    const response = await axios.get(`/invoices/${id}`);
    return response.data;
  }

  async downloadInvoicePdf(id: number): Promise<Blob> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;

    const response = await axios.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });

    return response.data;
  }

  async deleteInvoice(id: number): Promise<Response<null>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;

    const response = await axios.delete(`/invoices/${id}`);
    return response.data;
  }
}

export default InvoiceService;
