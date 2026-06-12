import { useService } from "@contexts/ServiceContext";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@app/shared/types/axios";
import { useEffect, useState } from "react";
import {
  InvoiceAdjustmentRequest,
  InvoiceAdjustmentTableDetails,
  InvoiceDetails,
} from "@app/shared/types/services/invoice";
import { useMessage } from "@app/contexts/MessageContext";
import { useNavigate } from "react-router-dom";

const generateAdjustmentKey = () =>
  `adj-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const generateNextSortValue = (
  items: InvoiceAdjustmentTableDetails[],
  type: string
): number => {
  const sortValues = items
    .filter((item) => item.type === type)
    .map((item) => item.sort);

  if (sortValues.length === 0) return 1;

  return Math.max(...sortValues) + 1;
};

const useInvoiceDetails = (invoiceId?: number) => {
  const { invoice } = useService();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adjustments, setAdjustments] = useState<
    InvoiceAdjustmentTableDetails[]
  >([]);
  const { success: successMsg, error: errorMsg } = useMessage();
  const navigate = useNavigate();

  const query = useQuery<ApiResponse<InvoiceDetails>, AxiosError>({
    queryKey: ["invoice-details", invoiceId],
    enabled: Boolean(invoiceId),
    retry: 1,
    queryFn: async () => {
      return await invoice.getInvoiceById(invoiceId as number);
    },
  });

  const handleAddAdjustment = (type: "ADDITIONAL" | "DEDUCTION") => {
    setAdjustments((prev) => [
      ...prev,
      {
        id: 0,
        invoiceId: invoiceId || 0,
        type,
        rowKey: generateAdjustmentKey(),
        description: "",
        quantity: 1,
        price: 0,
        sort: generateNextSortValue(prev, type),
        isDeleted: false,
      },
    ]);
  };

  const handleDeleteItem = (rowKey: string) => {
    setAdjustments((prev) => {
      const found = prev.find((item) => item.rowKey === rowKey);

      if (found?.id) {
        return prev.map((item) =>
          item.rowKey === rowKey ? { ...item, isDeleted: true } : item
        );
      } else {
        return prev.filter((item) => item.rowKey !== rowKey);
      }
    });
  };

  const handleAdjustmentChange = <
    K extends keyof InvoiceAdjustmentTableDetails,
  >(
    rowKey: string,
    field: K,
    value: InvoiceAdjustmentTableDetails[K]
  ) => {
    setAdjustments((prev) =>
      prev.map((item) =>
        item.rowKey === rowKey ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveAdjustments = async () => {
    try {
      setIsSaving(true);
      const payload: InvoiceAdjustmentRequest = {
        invoice_id: invoiceId || 0,
        adjustments: adjustments.map((item) => ({
          ...(item.id ? { id: item.id } : {}),
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          sort: item.sort,
          is_deleted: item.isDeleted,
        })),
      };
      await invoice.saveAdjustments(payload);
      successMsg("Invoice adjustments saved successfully!");
      query.refetch();
    } catch (error: any) {
      errorMsg(
        error.message || "Failed to save invoice adjustments. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const pdfBlob = await invoice.downloadInvoicePdf(invoiceId);
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${query.data?.data?.invoice_no || `invoice-${invoiceId}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      errorMsg("Failed to download PDF invoice");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      setIsPreviewingPdf(true);
      const pdfBlob = await invoice.downloadInvoicePdf(invoiceId);
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(objectUrl, "_blank");

      if (!previewWindow) {
        window.URL.revokeObjectURL(objectUrl);
        errorMsg("Popup blocked. Please allow popups to preview PDF.");
        return;
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 60_000);
    } catch {
      errorMsg("Failed to preview PDF invoice");
    } finally {
      setIsPreviewingPdf(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceId) {
      return;
    }

    try {
      setIsDeleting(true);
      await invoice.deleteInvoice(invoiceId);
      successMsg("Invoice deleted successfully");
      navigate("/invoices");
    } catch {
      errorMsg("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setAdjustments(
      () =>
        query.data?.data?.invoice_adjustments.map((item) => ({
          id: item.id,
          invoiceId: item.invoice_id,
          type: item.type,
          rowKey: String(item.id),
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          sort: item.sort,
          isDeleted: false,
        })) ?? []
    );
  }, [query.data?.data?.invoice_adjustments]);

  return {
    ...query,
    adjustments,
    additions: adjustments.filter(
      (item) => item.type === "ADDITIONAL" && !item.isDeleted
    ),
    deductions: adjustments.filter(
      (item) => item.type === "DEDUCTION" && !item.isDeleted
    ),
    invoice: query.data?.data || null,
    isDownloadingPdf,
    isPreviewingPdf,
    isDeleting,
    isSaving,
    handleDownloadPdf,
    handlePreviewPdf,
    handleDeleteInvoice,
    handleAddAdjustment,
    handleDeleteItem,
    handleAdjustmentChange,
    handleSaveAdjustments,
  };
};

export default useInvoiceDetails;
