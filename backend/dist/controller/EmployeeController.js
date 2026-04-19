"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const services_1 = require("../services");
const EmployeeValidator_1 = require("../validators/EmployeeValidator");
class EmployeeController {
    constructor() {
        this.employeeService = new services_1.EmployeeService();
        this.responseBuilder = new utils_1.ResponseBuilder();
    }
    async getAllEmployees(req, res) {
        try {
            const employees = await this.employeeService.getAllEmployees();
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(employees, "Employees Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async getEmployeeById(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = EmployeeValidator_1.EmployeeIdParamSchema.parse({ id: req.params.id });
            const employee = await this.employeeService.getEmployeeById(id);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(employee, "Employee Retrieved Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async createEmployee(req, res) {
        try {
            // Validate request body with Zod
            const validatedData = EmployeeValidator_1.EmployeeCreateSchema.parse(req.body);
            const employee = await this.employeeService.createEmployee(validatedData);
            return res
                .status(HttpStatus_1.default.CREATED)
                .json(this.responseBuilder.created(employee, "Employee Created Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async updateEmployee(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = EmployeeValidator_1.EmployeeIdParamSchema.parse({ id: req.params.id });
            // Validate request body with Zod
            const validatedData = EmployeeValidator_1.EmployeeUpdateSchema.parse(req.body);
            const employee = await this.employeeService.updateEmployee(id, validatedData);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(employee, "Employee Updated Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async deleteEmployee(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = EmployeeValidator_1.EmployeeIdParamSchema.parse({ id: req.params.id });
            await this.employeeService.deleteEmployee(id);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(null, "Employee Deleted Successfully"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
    async searchEmployees(req, res) {
        try {
            const query = req.query.q || "";
            if (!query || typeof query !== "string" || query.trim().length === 0) {
                return res
                    .status(HttpStatus_1.default.OK)
                    .json(this.responseBuilder.ok([], "Search query is empty"));
            }
            const employees = await this.employeeService.searchEmployees(query.trim(), 5);
            return res
                .status(HttpStatus_1.default.OK)
                .json(this.responseBuilder.ok(employees, "Employees Search Results"));
        }
        catch (error) {
            const response = (0, utils_1.handleErrors)(error);
            return res.status(response.status).json(response);
        }
    }
}
exports.default = EmployeeController;
