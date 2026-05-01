"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppSourceData_1 = require("../config/AppSourceData");
const Employee_1 = require("../entities/Employee");
const exceptions_1 = require("../exceptions");
const typeorm_1 = require("typeorm");
const EmployeeValidator_1 = require("../validators/EmployeeValidator");
class EmployeeService {
    constructor() {
        this.employeeRepository = AppSourceData_1.AppDataSource.getRepository(Employee_1.Employee);
    }
    async getAllEmployees() {
        return await this.employeeRepository.find();
    }
    async getEmployeeById(idStr) {
        // Validate ID with Zod
        const { id } = EmployeeValidator_1.EmployeeIdParamSchema.parse({ id: String(idStr) });
        const employee = await this.employeeRepository.findOne({ where: { id } });
        if (!employee)
            throw new exceptions_1.ResourceNotFound("Employee not found");
        return employee;
    }
    async getEmployeeByNo(employee_no) {
        return await this.employeeRepository.findOne({ where: { employee_no } });
    }
    async createEmployee(data) {
        // Validate with Zod schema
        const validatedData = EmployeeValidator_1.EmployeeCreateSchema.parse(data);
        const existingEmployee = await this.getEmployeeByNo(validatedData.employee_no);
        if (existingEmployee) {
            throw new exceptions_1.ResourceConflict("Employee with this employee_no already exists");
        }
        const newEmployee = this.employeeRepository.create({
            employee_no: validatedData.employee_no,
            employee_name: validatedData.employee_name,
            date_of_birth: new Date(validatedData.date_of_birth),
            status: validatedData.status,
        });
        return await this.employeeRepository.save(newEmployee);
    }
    async updateEmployee(idStr, data) {
        // Validate ID with Zod
        const { id } = EmployeeValidator_1.EmployeeIdParamSchema.parse({ id: String(idStr) });
        const employee = await this.getEmployeeById(id);
        // Validate update data with Zod schema
        const validatedData = EmployeeValidator_1.EmployeeUpdateSchema.parse(data);
        if (validatedData.employee_no &&
            validatedData.employee_no !== employee.employee_no) {
            const existingEmployee = await this.getEmployeeByNo(validatedData.employee_no);
            if (existingEmployee) {
                throw new exceptions_1.ResourceConflict("Employee with this employee_no already exists");
            }
        }
        const updateData = {};
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
    async deleteEmployee(idStr) {
        // Validate ID with Zod
        const { id } = EmployeeValidator_1.EmployeeIdParamSchema.parse({ id: String(idStr) });
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
    async searchEmployees(query, limit = 5) {
        return await this.employeeRepository
            .createQueryBuilder("employee")
            .where("employee.status = :status", {
            status: "active",
        })
            .andWhere(new typeorm_1.Brackets((qb) => {
            qb.where("LOWER(employee.employee_name) LIKE LOWER(:query)", {
                query: `%${query}%`,
            }).orWhere("LOWER(employee.employee_no) LIKE LOWER(:query)", {
                query: `%${query}%`,
            });
        }))
            .limit(limit)
            .orderBy("employee.employee_name", "DESC")
            .getMany();
    }
}
exports.default = EmployeeService;
