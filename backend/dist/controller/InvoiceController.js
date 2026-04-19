"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const utils_1 = require("../utils");
const services_1 = require("../services");
const InvoiceValidator_1 = require("../validators/InvoiceValidator");
const InvoicePdfGenerator_1 = require("../utils/InvoicePdfGenerator");
class InvoiceController {
    constructor() {
        this.invoiceService = new services_1.InvoiceService();
        this.responseBuilder = new utils_1.ResponseBuilder();
    }
    async getAllInvoices(req, res) {
        try {
            const invoices = await this.invoiceService.getAllInvoices();
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(invoices, "Invoices Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async getInvoiceById(req, res) {
        try {
            const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: req.params.id });
            const invoice = await this.invoiceService.getInvoiceById(id);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(invoice, "Invoice Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async downloadInvoicePdf(req, res) {
        try {
            const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: req.params.id });
            const invoice = await this.invoiceService.getInvoiceById(id);
            const pdfBuffer = await (0, InvoicePdfGenerator_1.generateInvoicePdfBuffer)(invoice);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoice_no}.pdf"`);
            return res.status(HttpStatus_1.default.OK).send(pdfBuffer);
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async searchInvoices(req, res) {
        try {
            const validatedQuery = InvoiceValidator_1.InvoiceSearchQuerySchema.parse(req.query);
            const invoices = await this.invoiceService.searchInvoices(validatedQuery);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(invoices, "Invoices Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async createInvoice(req, res) {
        try {
            const validatedData = InvoiceValidator_1.InvoiceCreateSchema.parse(req.body);
            const invoice = await this.invoiceService.createInvoice(validatedData);
            return res
                .status(HttpStatus_1.default.CREATED)
                .json(this.responseBuilder.created(invoice, "Invoice Created Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async updateInvoice(req, res) {
        try {
            const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: req.params.id });
            const validatedData = InvoiceValidator_1.InvoiceUpdateSchema.parse(req.body);
            const invoice = await this.invoiceService.updateInvoice(id, validatedData);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(invoice, "Invoice Updated Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async deleteInvoice(req, res) {
        try {
            const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: req.params.id });
            await this.invoiceService.deleteInvoice(id);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(null, "Invoice Deleted Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
}
exports.default = InvoiceController;
