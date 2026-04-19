import { Request, Response } from "express";
import BackendResponse from "../types/Response";
import HttpStatus from "../shared/HttpStatus";
import { handleErrors, ResponseBuilder } from "../utils";
import { InvoiceService } from "../services";
import {
  CreateInvoiceRequest,
  SearchInvoiceQueryRequest,
  UpdateInvoiceRequest,
} from "../types/Invoice";
import {
  InvoiceCreateSchema,
  InvoiceIdParamSchema,
  InvoiceSearchQuerySchema,
  InvoiceUpdateSchema,
} from "../validators/InvoiceValidator";
import { generateInvoicePdfBuffer } from "../utils/InvoicePdfGenerator";

class InvoiceController {
  private readonly invoiceService;
  private readonly responseBuilder;

  constructor() {
    this.invoiceService = new InvoiceService();
    this.responseBuilder = new ResponseBuilder();
  }

  async getAllInvoices(
    req: Request,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const invoices = await this.invoiceService.getAllInvoices();
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(invoices, "Invoices Retrieved Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async getInvoiceById(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const { id } = InvoiceIdParamSchema.parse({ id: req.params.id });
      const invoice = await this.invoiceService.getInvoiceById(id);

      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(invoice, "Invoice Retrieved Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async downloadInvoicePdf(
    req: Request<{ id?: string }>,
    res: Response,
  ): Promise<Response> {
    try {
      const { id } = InvoiceIdParamSchema.parse({ id: req.params.id });
      const invoice = await this.invoiceService.getInvoiceById(id);
      const pdfBuffer = await generateInvoicePdfBuffer(invoice);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoice.invoice_no}.pdf"`,
      );

      return res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async searchInvoices(
    req: Request<{}, {}, {}, SearchInvoiceQueryRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const validatedQuery = InvoiceSearchQuerySchema.parse(req.query);
      const invoices = await this.invoiceService.searchInvoices(validatedQuery);

      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(invoices, "Invoices Retrieved Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async createInvoice(
    req: Request<{}, {}, CreateInvoiceRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const validatedData = InvoiceCreateSchema.parse(req.body);
      const invoice = await this.invoiceService.createInvoice(validatedData);

      return res
        .status(HttpStatus.CREATED)
        .json(
          this.responseBuilder.created(invoice, "Invoice Created Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async updateInvoice(
    req: Request<{ id?: string }, {}, UpdateInvoiceRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const { id } = InvoiceIdParamSchema.parse({ id: req.params.id });
      const validatedData = InvoiceUpdateSchema.parse(req.body);

      const invoice = await this.invoiceService.updateInvoice(
        id,
        validatedData,
      );

      return res
        .status(HttpStatus.OK)
        .json(this.responseBuilder.ok(invoice, "Invoice Updated Successfully"));
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async deleteInvoice(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const { id } = InvoiceIdParamSchema.parse({ id: req.params.id });
      await this.invoiceService.deleteInvoice(id);

      return res
        .status(HttpStatus.OK)
        .json(this.responseBuilder.ok(null, "Invoice Deleted Successfully"));
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }
}

export default InvoiceController;
