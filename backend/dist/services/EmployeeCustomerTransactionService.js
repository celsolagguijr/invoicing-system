"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppSourceData_1 = require("../config/AppSourceData");
const EmployeeCustomerTransaction_1 = require("../entities/EmployeeCustomerTransaction");
const Employee_1 = require("../entities/Employee");
const Client_1 = require("../entities/Client");
const exceptions_1 = require("../exceptions");
const EmployeeCustomerTransactionValidator_1 = require("../validators/EmployeeCustomerTransactionValidator");
const dateUtils_1 = require("../utils/dateUtils");
class EmployeeCustomerTransactionService {
    constructor() {
        this.transactionRepository = AppSourceData_1.AppDataSource.getRepository(EmployeeCustomerTransaction_1.EmployeeCustomerTransaction);
        this.employeeRepository = AppSourceData_1.AppDataSource.getRepository(Employee_1.Employee);
        this.clientRepository = AppSourceData_1.AppDataSource.getRepository(Client_1.Client);
    }
    normalizeDateKey(dateStr) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        const [month, day, year] = dateStr.split("/");
        return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    async getAllTransactions() {
        return await this.transactionRepository.find({
            relations: ["employee", "customer"],
        });
    }
    async getTransactionsByDateRange(query) {
        const validatedQuery = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionDateRangeQuerySchema.parse(query);
        const queryBuilder = this.transactionRepository
            .createQueryBuilder("transaction")
            .leftJoinAndSelect("transaction.employee", "employee")
            .leftJoinAndSelect("transaction.customer", "customer")
            .where("transaction.date >= :startDate", {
            startDate: validatedQuery.start_date,
        })
            .andWhere("transaction.date <= :endDate", {
            endDate: validatedQuery.end_date,
        })
            .orderBy("transaction.date", "ASC");
        if (validatedQuery.employee_id !== undefined) {
            queryBuilder.andWhere("transaction.employee_id = :employeeId", {
                employeeId: validatedQuery.employee_id,
            });
        }
        if (validatedQuery.client_id !== undefined) {
            queryBuilder.andWhere("transaction.customer_id = :clientId", {
                clientId: validatedQuery.client_id,
            });
        }
        return await queryBuilder.getMany();
    }
    async getTransactionById(idStr) {
        // Validate ID with Zod
        const { id } = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionIdParamSchema.parse({
            id: String(idStr),
        });
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ["employee", "customer"],
        });
        if (!transaction)
            throw new exceptions_1.ResourceNotFound("Transaction not found");
        return transaction;
    }
    async createTransaction(data) {
        // Validate with Zod schema
        const validatedData = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionCreateSchema.parse(data);
        // Verify employee exists
        const employee = await this.employeeRepository.findOne({
            where: { id: validatedData.employee_id },
        });
        if (!employee) {
            throw new exceptions_1.ResourceNotFound("Employee not found");
        }
        // Verify client exists
        const client = await this.clientRepository.findOne({
            where: { id: validatedData.customer_id },
        });
        if (!client) {
            throw new exceptions_1.ResourceNotFound("Client not found");
        }
        const newTransaction = this.transactionRepository.create({
            employee_id: validatedData.employee_id,
            customer_id: validatedData.customer_id,
            working_hours: validatedData.working_hours,
            ot_working_hours: validatedData.ot_working_hours,
            date: (0, dateUtils_1.toDateString)(validatedData.date),
            remarks: validatedData.remarks ?? null,
        });
        return await this.transactionRepository.save(newTransaction);
    }
    async createBatchTransactions(data) {
        // Validate batch data with Zod schema
        const validatedTransactions = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionBatchCreateSchema.parse(data.transactions);
        // Get all unique employee and customer IDs to verify they exist
        const uniqueEmployeeIds = [
            ...new Set(validatedTransactions.map((t) => t.employee_id)),
        ];
        const uniqueCustomerIds = [
            ...new Set(validatedTransactions.map((t) => t.customer_id)),
        ];
        // Verify all employees exist
        const employees = await this.employeeRepository.find({
            where: uniqueEmployeeIds.map((id) => ({ id })),
        });
        const employeeIdSet = new Set(employees.map((e) => e.id));
        const missingEmployeeIds = uniqueEmployeeIds.filter((id) => !employeeIdSet.has(id));
        if (missingEmployeeIds.length > 0) {
            throw new exceptions_1.ResourceNotFound(`Employees not found: ${missingEmployeeIds.join(", ")}`);
        }
        // Verify all clients exist
        const clients = await this.clientRepository.find({
            where: uniqueCustomerIds.map((id) => ({ id })),
        });
        const clientIdSet = new Set(clients.map((c) => c.id));
        const missingClientIds = uniqueCustomerIds.filter((id) => !clientIdSet.has(id));
        if (missingClientIds.length > 0) {
            throw new exceptions_1.ResourceNotFound(`Clients not found: ${missingClientIds.join(", ")}`);
        }
        const employeeNameById = new Map(employees.map((employee) => [employee.id, employee.employee_name]));
        const clientNameById = new Map(clients.map((client) => [client.id, client.name]));
        const existingTransactions = await this.transactionRepository.find({
            where: uniqueEmployeeIds.flatMap((employeeId) => uniqueCustomerIds.map((customerId) => ({
                employee_id: employeeId,
                customer_id: customerId,
            }))),
            select: ["employee_id", "customer_id", "date"],
        });
        const existingKeys = new Set(existingTransactions.map((t) => {
            const date = t.date instanceof Date
                ? t.date.toISOString().slice(0, 10)
                : String(t.date).slice(0, 10);
            return `${t.employee_id}:${t.customer_id}:${date}`;
        }));
        const duplicatedAgainstDb = validatedTransactions.flatMap((transaction, index) => {
            const normalizedDate = this.normalizeDateKey(transaction.date);
            const key = `${transaction.employee_id}:${transaction.customer_id}:${normalizedDate}`;
            if (!existingKeys.has(key)) {
                return [];
            }
            const employeeName = employeeNameById.get(transaction.employee_id) ||
                `Employee ${transaction.employee_id}`;
            const clientName = clientNameById.get(transaction.customer_id) ||
                `Client ${transaction.customer_id}`;
            return [
                {
                    path: `Transactions > Row ${index + 1}`,
                    client: clientName,
                    employee: employeeName,
                    message: `Duplicate timelog already exists in past timelogs for employee ${employeeName} and client ${clientName} on ${normalizedDate}.`,
                },
            ];
        });
        if (duplicatedAgainstDb.length > 0) {
            throw new exceptions_1.StructuredApiError("Duplicate timelog already exists in past timelogs for one or more rows.", duplicatedAgainstDb);
        }
        // Create transaction entities
        const transactions = validatedTransactions.map((t) => this.transactionRepository.create({
            employee_id: t.employee_id,
            customer_id: t.customer_id,
            working_hours: t.working_hours,
            ot_working_hours: t.ot_working_hours,
            date: (0, dateUtils_1.toDateString)(t.date),
            remarks: t.remarks ?? null,
        }));
        // Save all transactions at once
        const savedTransactions = await this.transactionRepository.save(transactions);
        // Reload with relations
        return await Promise.all(savedTransactions.map((t) => this.getTransactionById(t.id)));
    }
    async updateTransaction(idStr, data) {
        // Validate ID with Zod
        const { id } = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionIdParamSchema.parse({
            id: String(idStr),
        });
        const transaction = await this.getTransactionById(id);
        // Validate update data with Zod schema
        const validatedData = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionUpdateSchema.parse(data);
        // Verify employee exists if being updated
        if (validatedData.employee_id) {
            const employee = await this.employeeRepository.findOne({
                where: { id: validatedData.employee_id },
            });
            if (!employee) {
                throw new exceptions_1.ResourceNotFound("Employee not found");
            }
        }
        // Verify client exists if being updated
        if (validatedData.customer_id) {
            const client = await this.clientRepository.findOne({
                where: { id: validatedData.customer_id },
            });
            if (!client) {
                throw new exceptions_1.ResourceNotFound("Client not found");
            }
        }
        const updateData = {};
        if (validatedData.employee_id) {
            updateData.employee_id = validatedData.employee_id;
        }
        if (validatedData.customer_id) {
            updateData.customer_id = validatedData.customer_id;
        }
        if (validatedData.working_hours !== undefined) {
            updateData.working_hours = validatedData.working_hours;
        }
        if (validatedData.ot_working_hours !== undefined) {
            updateData.ot_working_hours = validatedData.ot_working_hours;
        }
        if (validatedData.date) {
            updateData.date = (0, dateUtils_1.toDateString)(validatedData.date);
        }
        if (validatedData.remarks !== undefined) {
            updateData.remarks = validatedData.remarks;
        }
        await this.transactionRepository.update(id, updateData);
        return await this.getTransactionById(id);
    }
    async deleteTransaction(idStr) {
        // Validate ID with Zod
        const { id } = EmployeeCustomerTransactionValidator_1.EmployeeCustomerTransactionIdParamSchema.parse({
            id: String(idStr),
        });
        await this.getTransactionById(id);
        const result = await this.transactionRepository.delete(id);
        if ((result.affected ?? 0) === 0) {
            throw new Error("Failed to delete transaction");
        }
    }
}
exports.default = EmployeeCustomerTransactionService;
