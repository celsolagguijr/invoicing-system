import { useService } from "@contexts/ServiceContext";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@app/shared/types/axios";
import type { InvoiceDetails } from "@app/services/InvoiceService";

const useInvoiceDetails = (invoiceId?: number) => {
  const { invoice } = useService();

  const query = useQuery<ApiResponse<InvoiceDetails>, AxiosError>({
    queryKey: ["invoice-details", invoiceId],
    enabled: Boolean(invoiceId),
    retry: 1,
    queryFn: async () => {
      return await invoice.getInvoiceById(invoiceId as number);
    },
  });

  return {
    ...query,
    invoice: query.data?.data || null,
  };
};

export default useInvoiceDetails;
