import { Request, Response } from "express";
import BackendResponse from "../types/Response";
import { handleErrors, ResponseBuilder } from "../utils";
import HttpStatus from "../shared/HttpStatus";
import { EmployeeCustomerTransactionService } from "../services";
import {
  CreateEmployeeCustomerTransactionRequest,
  CreateEmployeeCustomerTransactionBatchRequest,
  UpdateEmployeeCustomerTransactionRequest,
} from "../types/EmployeeCustomerTransaction";
import {
  EmployeeCustomerTransactionCreateSchema,
  EmployeeCustomerTransactionBatchCreateSchema,
  EmployeeCustomerTransactionUpdateSchema,
  EmployeeCustomerTransactionIdParamSchema,
  EmployeeCustomerTransactionDateRangeQuerySchema,
} from "../validators/EmployeeCustomerTransactionValidator";

class EmployeeCustomerTransactionController {
  private readonly transactionService;
  private readonly responseBuilder;

  constructor() {
    this.transactionService = new EmployeeCustomerTransactionService();
    this.responseBuilder = new ResponseBuilder();
  }

  async getAllTransactions(
    req: Request,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const transactions = await this.transactionService.getAllTransactions();
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(
            transactions,
            "Transactions Retrieved Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async getTransactionById(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = EmployeeCustomerTransactionIdParamSchema.parse({
        id: req.params.id,
      });

      const transaction = await this.transactionService.getTransactionById(id);
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(
            transaction,
            "Transaction Retrieved Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async getTransactionsByDateRange(
    req: Request<
      {},
      {},
      {},
      {
        start_date?: string;
        end_date?: string;
        employee_id?: string;
        client_id?: string;
      }
    >,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const validatedQuery =
        EmployeeCustomerTransactionDateRangeQuerySchema.parse({
          start_date: req.query.start_date,
          end_date: req.query.end_date,
          employee_id: req.query.employee_id,
          client_id: req.query.client_id,
        });

      const transactions =
        await this.transactionService.getTransactionsByDateRange(
          validatedQuery,
        );

      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(
            transactions,
            "Transactions Retrieved Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async createTransaction(
    req: Request<{}, {}, CreateEmployeeCustomerTransactionRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate request body with Zod
      const validatedData = EmployeeCustomerTransactionCreateSchema.parse(
        req.body,
      );

      const transaction =
        await this.transactionService.createTransaction(validatedData);
      return res
        .status(HttpStatus.CREATED)
        .json(
          this.responseBuilder.created(
            transaction,
            "Transaction Created Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async createBatchTransactions(
    req: Request<{}, {}, CreateEmployeeCustomerTransactionBatchRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate request body with Zod
      const validatedTransactions =
        EmployeeCustomerTransactionBatchCreateSchema.parse(
          req.body.transactions,
        );

      const transactions =
        await this.transactionService.createBatchTransactions({
          transactions: validatedTransactions,
        });
      return res
        .status(HttpStatus.CREATED)
        .json(
          this.responseBuilder.created(
            transactions,
            `${transactions.length} Transactions Created Successfully`,
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async updateTransaction(
    req: Request<{ id?: string }, {}, UpdateEmployeeCustomerTransactionRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = EmployeeCustomerTransactionIdParamSchema.parse({
        id: req.params.id,
      });

      // Validate request body with Zod
      const validatedData = EmployeeCustomerTransactionUpdateSchema.parse(
        req.body,
      );

      const transaction = await this.transactionService.updateTransaction(
        id,
        validatedData,
      );
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(
            transaction,
            "Transaction Updated Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async deleteTransaction(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = EmployeeCustomerTransactionIdParamSchema.parse({
        id: req.params.id,
      });

      await this.transactionService.deleteTransaction(id);
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(null, "Transaction Deleted Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }
}

export default EmployeeCustomerTransactionController;
