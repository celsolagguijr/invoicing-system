import { Router, Request, Response } from "express";
import { EmployeeCustomerTransactionController } from "../controller";
import ValidateToken from "../middlewares/ValidateToken";

const router = Router();

const transactionController = new EmployeeCustomerTransactionController();
const validateToken = new ValidateToken();

/**
 * GET /api/transactions
 * @description Get all employee-customer transactions (requires authentication)
 * @returns {Array<EmployeeCustomerTransaction>} Array of all transactions
 * @requires Authorization: Bearer <token>
 */
router.get(
  "/transactions",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.getAllTransactions(req, res),
);

/**
 * GET /api/transactions/date-range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&employee_id=<id>&client_id=<id>
 * @description Get employee-customer transactions by date range (requires authentication)
 * @param {string} req.query.start_date - Start date in YYYY-MM-DD format
 * @param {string} req.query.end_date - End date in YYYY-MM-DD format
 * @param {number} req.query.employee_id - Employee ID (optional)
 * @param {number} req.query.client_id - Client ID (optional)
 * @returns {Array<EmployeeCustomerTransaction>} Array of transactions in the specified date range
 * @requires Authorization: Bearer <token>
 */
router.get(
  "/transactions/date-range",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.getTransactionsByDateRange(req, res),
);

/**
 * GET /api/transactions/:id
 * @description Get transaction details by ID (requires authentication)
 * @param {string} req.params.id - Transaction ID
 * @returns {EmployeeCustomerTransaction} Transaction details
 * @requires Authorization: Bearer <token>
 */
router.get(
  "/transactions/:id",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.getTransactionById(req, res),
);

/**
 * POST /api/transactions
 * @description Create a new employee-customer transaction (requires authentication)
 * @param {number} req.body.employee_id - Employee ID (foreign key)
 * @param {number} req.body.customer_id - Client ID (foreign key)
 * @param {number} req.body.working_hours - Working hours (decimal)
 * @param {string} req.body.date - Transaction date (YYYY-MM-DD or MM/DD/YYYY)
 * @returns {EmployeeCustomerTransaction} Created transaction
 * @requires Authorization: Bearer <token>
 */
router.post(
  "/transactions",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.createTransaction(req, res),
);

/**
 * POST /api/transactions/batch
 * @description Create multiple employee-customer transactions in one request (requires authentication)
 * @param {Array} req.body.transactions - Array of transaction objects
 * @param {number} req.body.transactions[].employee_id - Employee ID (foreign key)
 * @param {number} req.body.transactions[].customer_id - Client ID (foreign key)
 * @param {number} req.body.transactions[].working_hours - Working hours (decimal)
 * @param {string} req.body.transactions[].date - Transaction date (YYYY-MM-DD or MM/DD/YYYY)
 * @returns {Array<EmployeeCustomerTransaction>} Array of created transactions
 * @requires Authorization: Bearer <token>
 * @example
 * Request body:
 * {
 *   "transactions": [
 *     { "employee_id": 1, "customer_id": 1, "working_hours": 8, "date": "2024-01-15" },
 *     { "employee_id": 2, "customer_id": 2, "working_hours": 6.5, "date": "2024-01-15" }
 *   ]
 * }
 */
router.post(
  "/transactions/batch",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.createBatchTransactions(req, res),
);

/**
 * PUT /api/transactions/:id
 * @description Update an employee-customer transaction (requires authentication)
 * @param {string} req.params.id - Transaction ID
 * @param {number} req.body.employee_id - Employee ID (optional)
 * @param {number} req.body.customer_id - Client ID (optional)
 * @param {number} req.body.working_hours - Working hours (optional)
 * @param {string} req.body.date - Transaction date (optional)
 * @returns {EmployeeCustomerTransaction} Updated transaction
 * @requires Authorization: Bearer <token>
 */
router.put(
  "/transactions/:id",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.updateTransaction(req, res),
);

/**
 * DELETE /api/transactions/:id
 * @description Delete a transaction (requires authentication)
 * @param {string} req.params.id - Transaction ID
 * @returns {null} No content
 * @requires Authorization: Bearer <token>
 */
router.delete(
  "/transactions/:id",
  validateToken.validate,
  (req: Request, res: Response) =>
    transactionController.deleteTransaction(req, res),
);

export default router;
