"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const services_1 = require("../services");
const EmployeeCustomerTransactionValidator_1 = require("../validators/EmployeeCustomerTransactionValidator");
class EmployeeCustomerTransactionController {
    constructor() {
        this.transactionService = new services_1.EmployeeCustomerTransactionService();
        this.responseBuilder = new utils_1.ResponseBuilder();
    }
    async getAllTransactions(req, res) {
        try {
            const transactions = await this.transactionService.getAllTransactions();
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(transactions, "Transactions Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async getTransactionById(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionIdParamSchema.parse({
                id: req.params.id,
            });
            const transaction = await this.transactionService.getTransactionById(id);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(transaction, "Transaction Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async getTransactionsByDateRange(req, res) {
        try {
            const validatedQuery = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionDateRangeQuerySchema.parse({
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                employee_id: req.query.employee_id,
                client_id: req.query.client_id,
            });
            const transactions = await this.transactionService.getTransactionsByDateRange(validatedQuery);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(transactions, "Transactions Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async createTransaction(req, res) {
        try {
            // Validate request body with Zod
            const validatedData = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionCreateSchema.parse(req.body);
            const transaction = await this.transactionService.createTransaction(validatedData);
            return res
                .status(HttpStatus_1.default.CREATED)
                .json(this.responseBuilder.created(transaction, "Transaction Created Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async createBatchTransactions(req, res) {
        try {
            // Validate request body with Zod
            const validatedTransactions = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionBatchCreateSchema.parse(req.body.transactions);
            const transactions = await this.transactionService.createBatchTransactions({
                transactions: validatedTransactions,
            });
            return res
                .status(HttpStatus_1.default.CREATED)
                .json(this.responseBuilder.created(transactions, `${transactions.length} Transactions Created Successfully`));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async updateTransaction(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionIdParamSchema.parse({
                id: req.params.id,
            });
            // Validate request body with Zod
            const validatedData = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionUpdateSchema.parse(req.body);
            const transaction = await this.transactionService.updateTransaction(id, validatedData);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(transaction, "Transaction Updated Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async deleteTransaction(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionIdParamSchema.parse({
                id: req.params.id,
            });
            await this.transactionService.deleteTransaction(id);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(null, "Transaction Deleted Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
}
exports.default = EmployeeCustomerTransactionController;
