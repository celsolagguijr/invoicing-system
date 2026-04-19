"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../controller");
const ValidateToken_1 = __importDefault(require("../middlewares/ValidateToken"));
const router = (0, express_1.Router)();
const employeeController = new controller_1.EmployeeController();
const validateToken = new ValidateToken_1.default();
/**
 * GET /api/employees
 * @description Get all employees (requires authentication)
 * @returns {Array<Employee>} Array of all employees
 * @requires Authorization: Bearer <token>
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer jwt_token_here"
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "employee_no": "EMP001",
 *       "employee_name": "John Doe",
 *       "date_of_birth": "1990-01-01",
 *       "created_at": "2024-01-01T00:00:00Z",
 *       "updated_at": "2024-01-01T00:00:00Z"
 *     }
 *   ],
 *   "message": "Employees Retrieved Successfully"
 * }
 */
router.get("/employees/search", validateToken.validate, (req, res) => employeeController.searchEmployees(req, res));
router.get("/employees", validateToken.validate, (req, res) => employeeController.getAllEmployees(req, res));
/**
 * GET /api/employees/:id
 * @description Get employee details by ID (requires authentication)
 * @param {string} req.params.id - Employee ID
 * @returns {Employee} Employee details
 * @requires Authorization: Bearer <token>
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer jwt_token_here"
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "employee_no": "EMP001",
 *     "employee_name": "John Doe",
 *     "date_of_birth": "1990-01-01",
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "updated_at": "2024-01-01T00:00:00Z"
 *   },
 *   "message": "Employee Retrieved Successfully"
 * }
 */
router.get("/employees/:id", validateToken.validate, (req, res) => employeeController.getEmployeeById(req, res));
/**
 * POST /api/employees
 * @description Create a new employee (requires authentication)
 * @param {string} req.body.employee_no - Employee number (required, unique)
 * @param {string} req.body.employee_name - Employee name (required)
 * @param {string} req.body.date_of_birth - Date of birth in YYYY-MM-DD format (required)
 * @returns {Employee} Created employee with ID
 * @requires Authorization: Bearer <token>
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer jwt_token_here",
 *   "Content-Type": "application/json"
 * }
 * Request body:
 * {
 *   "employee_no": "EMP001",
 *   "employee_name": "John Doe",
 *   "date_of_birth": "1990-01-01"
 * }
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "employee_no": "EMP001",
 *     "employee_name": "John Doe",
 *     "date_of_birth": "1990-01-01",
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "updated_at": "2024-01-01T00:00:00Z"
 *   },
 *   "message": "Employee Created Successfully"
 * }
 */
router.post("/employees", validateToken.validate, (req, res) => employeeController.createEmployee(req, res));
/**
 * PUT /api/employees/:id
 * @description Update an employee (requires authentication)
 * @param {string} req.params.id - Employee ID
 * @param {string} req.body.employee_no - Employee number (optional, must be unique)
 * @param {string} req.body.employee_name - Employee name (optional)
 * @param {string} req.body.date_of_birth - Date of birth in YYYY-MM-DD format (optional)
 * @returns {Employee} Updated employee
 * @requires Authorization: Bearer <token>
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer jwt_token_here",
 *   "Content-Type": "application/json"
 * }
 * Request body:
 * {
 *   "employee_name": "Jane Doe"
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "employee_no": "EMP001",
 *     "employee_name": "Jane Doe",
 *     "date_of_birth": "1990-01-01",
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "updated_at": "2024-01-01T00:00:00Z"
 *   },
 *   "message": "Employee Updated Successfully"
 * }
 */
router.put("/employees/:id", validateToken.validate, (req, res) => employeeController.updateEmployee(req, res));
/**
 * DELETE /api/employees/:id
 * @description Delete an employee (requires authentication)
 * @param {string} req.params.id - Employee ID
 * @returns {null}
 * @requires Authorization: Bearer <token>
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer jwt_token_here"
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": null,
 *   "message": "Employee Deleted Successfully"
 * }
 */
router.delete("/employees/:id", validateToken.validate, (req, res) => employeeController.deleteEmployee(req, res));
exports.default = router;
