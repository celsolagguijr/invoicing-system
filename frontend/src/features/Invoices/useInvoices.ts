import { useService } from "@contexts/ServiceContext";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@app/shared/types/axios";
import type {
  InvoiceItem,
  SearchInvoiceParams,
} from "@app/services/InvoiceService";

const cleanSearchParams = (params: SearchInvoiceParams) => {
  const cleanParams: SearchInvoiceParams = {};

  if (params.invoice_no?.trim()) {
    cleanParams.invoice_no = params.invoice_no.trim();
  }

  if (params.client_id !== undefined) {
    cleanParams.client_id = params.client_id;
  }

  if (params.invoice_date) {
    cleanParams.invoice_date = params.invoice_date;
  }

  if (params.invoice_date_from) {
    cleanParams.invoice_date_from = params.invoice_date_from;
  }

  if (params.invoice_date_to) {
    cleanParams.invoice_date_to = params.invoice_date_to;
  }

  return cleanParams;
};

const hasAtLeastOneFilter = (params: SearchInvoiceParams) =>
  Boolean(params.invoice_no?.trim()) ||
  params.client_id !== undefined ||
  Boolean(params.invoice_date) ||
  Boolean(params.invoice_date_from) ||
  Boolean(params.invoice_date_to);

const useInvoices = (params: SearchInvoiceParams) => {
  const { invoice } = useService();
  const normalizedParams = cleanSearchParams(params);
  const shouldSearch = hasAtLeastOneFilter(normalizedParams);

  const query = useQuery<ApiResponse<InvoiceItem[]>, AxiosError>({
    queryKey: ["invoice-search", normalizedParams],
    enabled: shouldSearch,
    retry: 1,
    queryFn: async () => {
      if (!hasAtLeastOneFilter(normalizedParams)) {
        return {
          status: 200,
          message: "No filters provided",
          error: null,
          data: [],
        } as ApiResponse<InvoiceItem[]>;
      }

      return await invoice.searchInvoices(normalizedParams);
    },
  });

  return {
    ...query,
    invoices: query.data?.data || [],
  };
};

export default useInvoices;
