import { AppDataSource } from "../config/AppSourceData";
import { Employee } from "../entities/Employee";
import { ResourceConflict, ResourceNotFound } from "../exceptions";
import { Brackets } from "typeorm";
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "../types/Employee";
import {
  EmployeeCreateSchema,
  EmployeeUpdateSchema,
  EmployeeIdParamSchema,
} from "../validators/EmployeeValidator";

class EmployeeService {
  private readonly employeeRepository;

  constructor() {
    this.employeeRepository = AppDataSource.getRepository(Employee);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await this.employeeRepository.find();
  }

  async getEmployeeById(idStr: string | number): Promise<Employee> {
    // Validate ID with Zod
    const { id } = EmployeeIdParamSchema.parse({ id: String(idStr) });

    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) throw new ResourceNotFound("Employee not found");
    return employee;
  }

  async getEmployeeByNo(employee_no: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({ where: { employee_no } });
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    // Validate with Zod schema
    const validatedData = EmployeeCreateSchema.parse(data);

    const existingEmployee = await this.getEmployeeByNo(
      validatedData.employee_no,
    );
    if (existingEmployee) {
      throw new ResourceConflict(
        "Employee with this employee_no already exists",
      );
    }

    const newEmployee = this.employeeRepository.create({
      employee_no: validatedData.employee_no,
      employee_name: validatedData.employee_name,
      date_of_birth: new Date(validatedData.date_of_birth),
      status: validatedData.status,
    });
    return await this.employeeRepository.save(newEmployee);
  }

  async updateEmployee(
    idStr: string | number,
    data: UpdateEmployeeRequest,
  ): Promise<Employee> {
    // Validate ID with Zod
    const { id } = EmployeeIdParamSchema.parse({ id: String(idStr) });

    const employee = await this.getEmployeeById(id);

    // Validate update data with Zod schema
    const validatedData = EmployeeUpdateSchema.parse(data);

    if (
      validatedData.employee_no &&
      validatedData.employee_no !== employee.employee_no
    ) {
      const existingEmployee = await this.getEmployeeByNo(
        validatedData.employee_no,
      );
      if (existingEmployee) {
        throw new ResourceConflict(
          "Employee with this employee_no already exists",
        );
      }
    }

    const updateData: Partial<Employee> = {};
    if (validatedData.employee_no) {
      updateData.employee_no = validatedData.employee_no;
    }
    if (validatedData.employee_name) {
      updateData.employee_name = validatedData.employee_name;
    }
    if (validatedData.date_of_birth) {
      updateData.date_of_birth = new Date(validatedData.date_of_birth);
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    await this.employeeRepository.update(id, updateData);
    return await this.getEmployeeById(id);
  }

  async deleteEmployee(idStr: string | number): Promise<void> {
    // Validate ID with Zod
    const { id } = EmployeeIdParamSchema.parse({ id: String(idStr) });

    await this.getEmployeeById(id);
    const result = await this.employeeRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new Error("Failed to delete employee");
    }
  }

  /**
   * Search employees by name or employee number
   * @param {string} query - Search query string
   * @param {number} limit - Maximum number of results (default: 5)
   * @returns {Promise<Employee[]>} Array of matching employees
   */
  async searchEmployees(query: string, limit: number = 5): Promise<Employee[]> {
    return await this.employeeRepository
      .createQueryBuilder("employee")
      .where("employee.status = :status", {
        status: "active",
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where("LOWER(employee.employee_name) LIKE LOWER(:query)", {
            query: `%${query}%`,
          }).orWhere("LOWER(employee.employee_no) LIKE LOWER(:query)", {
            query: `%${query}%`,
          });
        }),
      )
      .limit(limit)
      .orderBy("employee.employee_name", "DESC")
      .getMany();
  }
}

export default EmployeeService;
