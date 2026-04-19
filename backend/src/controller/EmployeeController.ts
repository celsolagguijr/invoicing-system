import { Request, Response } from "express";
import BackendResponse from "../types/Response";
import { handleErrors, ResponseBuilder } from "../utils";
import HttpStatus from "../shared/HttpStatus";
import { EmployeeService } from "../services";
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "../types/Employee";
import {
  EmployeeCreateSchema,
  EmployeeUpdateSchema,
  EmployeeIdParamSchema,
} from "../validators/EmployeeValidator";

class EmployeeController {
  private readonly employeeService;
  private readonly responseBuilder;

  constructor() {
    this.employeeService = new EmployeeService();
    this.responseBuilder = new ResponseBuilder();
  }

  async getAllEmployees(
    req: Request,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const employees = await this.employeeService.getAllEmployees();
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(
            employees,
            "Employees Retrieved Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async getEmployeeById(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = EmployeeIdParamSchema.parse({ id: req.params.id });

      const employee = await this.employeeService.getEmployeeById(id);
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(employee, "Employee Retrieved Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async createEmployee(
    req: Request<{}, {}, CreateEmployeeRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate request body with Zod
      const validatedData = EmployeeCreateSchema.parse(req.body);

      const employee = await this.employeeService.createEmployee(validatedData);
      return res
        .status(HttpStatus.CREATED)
        .json(
          this.responseBuilder.created(
            employee,
            "Employee Created Successfully",
          ),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async updateEmployee(
    req: Request<{ id?: string }, {}, UpdateEmployeeRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = EmployeeIdParamSchema.parse({ id: req.params.id });

      // Validate request body with Zod
      const validatedData = EmployeeUpdateSchema.parse(req.body);

      const employee = await this.employeeService.updateEmployee(
        id,
        validatedData,
      );
      return res
        .status(HttpStatus.OK)
        .json(
          this.responseBuilder.ok(employee, "Employee Updated Successfully"),
        );
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async deleteEmployee(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = EmployeeIdParamSchema.parse({ id: req.params.id });

      await this.employeeService.deleteEmployee(id);
      return res
        .status(HttpStatus.OK)
        .json(this.responseBuilder.ok(null, "Employee Deleted Successfully"));
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }

  async searchEmployees(
    req: Request<{}, {}, {}, { q?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const query = req.query.q || "";

      if (!query || typeof query !== "string" || query.trim().length === 0) {
        return res
          .status(HttpStatus.OK)
          .json(this.responseBuilder.ok([], "Search query is empty"));
      }

      const employees = await this.employeeService.searchEmployees(
        query.trim(),
        5,
      );
      return res
        .status(HttpStatus.OK)
        .json(this.responseBuilder.ok(employees, "Employees Search Results"));
    } catch (error) {
      const response = handleErrors(error as Error);
      return res.status(response.status).json(response);
    }
  }
}

export default EmployeeController;
