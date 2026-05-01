"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppSourceData_1 = require("../config/AppSourceData");
const Client_1 = require("../entities/Client");
const Employee_1 = require("../entities/Employee");
const EmployeeCustomerTransaction_1 = require("../entities/EmployeeCustomerTransaction");
const Invoice_1 = require("../entities/Invoice");
const InvoiceDetail_1 = require("../entities/InvoiceDetail");
const exceptions_1 = require("../exceptions");
const InvoiceValidator_1 = require("../validators/InvoiceValidator");
const dateUtils_1 = require("../utils/dateUtils");
class InvoiceService {
    constructor() {
        this.invoiceRepository = AppSourceData_1.AppDataSource.getRepository(Invoice_1.Invoice);
        this.invoiceDetailRepository = AppSourceData_1.AppDataSource.getRepository(InvoiceDetail_1.InvoiceDetail);
        this.employeeCustomerTransactionRepository = AppSourceData_1.AppDataSource.getRepository(EmployeeCustomerTransaction_1.EmployeeCustomerTransaction);
        this.clientRepository = AppSourceData_1.AppDataSource.getRepository(Client_1.Client);
        this.employeeRepository = AppSourceData_1.AppDataSource.getRepository(Employee_1.Employee);
    }
    async getAllInvoices() {
        return await this.invoiceRepository.find({
            relations: ["client", "invoice_details", "invoice_details.employee"],
            order: { created_at: "DESC" },
        });
    }
    async searchInvoices(query) {
        const validatedQuery = InvoiceValidator_1.InvoiceSearchQuerySchema.parse(query);
        const queryBuilder = this.invoiceRepository
            .createQueryBuilder("invoice")
            .leftJoinAndSelect("invoice.client", "client")
            .leftJoinAndSelect("invoice.invoice_details", "invoice_details")
            .leftJoinAndSelect("invoice_details.employee", "employee")
            .orderBy("invoice.created_at", "DESC");
        if (validatedQuery.invoice_no) {
            queryBuilder.andWhere("invoice.invoice_no LIKE :invoiceNo", {
                invoiceNo: `%${validatedQuery.invoice_no}%`,
            });
        }
        if (validatedQuery.client_id !== undefined) {
            queryBuilder.andWhere("invoice.client_id = :clientId", {
                clientId: validatedQuery.client_id,
            });
        }
        if (validatedQuery.invoice_date) {
            queryBuilder.andWhere("DATE(invoice.invoice_date) = :invoiceDate", {
                invoiceDate: validatedQuery.invoice_date,
            });
        }
        if (validatedQuery.invoice_date_from) {
            queryBuilder.andWhere("DATE(invoice.invoice_date) >= :invoiceDateFrom", {
                invoiceDateFrom: validatedQuery.invoice_date_from,
            });
        }
        if (validatedQuery.invoice_date_to) {
            queryBuilder.andWhere("DATE(invoice.invoice_date) <= :invoiceDateTo", {
                invoiceDateTo: validatedQuery.invoice_date_to,
            });
        }
        return await queryBuilder.getMany();
    }
    async getInvoiceById(idStr) {
        const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: String(idStr) });
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ["client", "invoice_details", "invoice_details.employee"],
        });
        if (!invoice) {
            throw new exceptions_1.ResourceNotFound(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
    async createInvoice(data) {
        const validatedData = InvoiceValidator_1.InvoiceCreateSchema.parse(data);
        const { coverageStart, coverageEnd } = this.getCoverageRangeWithDefaults(validatedData.coverage_start, validatedData.coverage_end);
        const client = await this.clientRepository.findOne({
            where: { id: validatedData.client_id },
            select: ["id", "hourly_rate", "ot_hourly_rate"],
        });
        if (!client) {
            throw new exceptions_1.ResourceNotFound(`Client with ID ${validatedData.client_id} not found`);
        }
        const transactions = await this.employeeCustomerTransactionRepository
            .createQueryBuilder("transaction")
            .where("transaction.customer_id = :clientId", {
            clientId: validatedData.client_id,
        })
            .andWhere("transaction.date >= :coverageStart", {
            coverageStart,
        })
            .andWhere("transaction.date <= :coverageEnd", {
            coverageEnd,
        })
            .orderBy("transaction.date", "ASC")
            .addOrderBy("transaction.id", "ASC")
            .getMany();
        if (transactions.length === 0) {
            throw new exceptions_1.ResourceNotFound("No employee-customer transactions found for the selected client and coverage period");
        }
        const hourlyRate = Number(client.hourly_rate);
        const otHourlyRate = Number(client.ot_hourly_rate || 0);
        const totalWorkingHours = transactions.reduce((sum, transaction) => sum + Number(transaction.working_hours), 0);
        const totalOtWorkingHours = transactions.reduce((sum, transaction) => sum + Number(transaction.ot_working_hours || 0), 0);
        const totalAmount = hourlyRate * totalWorkingHours + otHourlyRate * totalOtWorkingHours;
        const invoiceDateStr = validatedData.invoice_date
            ? validatedData.invoice_date
            : this.formatDateOnly(new Date());
        const dueDateStr = validatedData.due_date
            ? validatedData.due_date
            : this.formatDateOnly(new Date());
        const invoiceEntity = this.invoiceRepository.create({
            invoice_no: this.generateTemporaryInvoiceNumber(),
            client_id: validatedData.client_id,
            invoice_date: invoiceDateStr,
            due_date: dueDateStr,
            coverage_start: coverageStart,
            coverage_end: coverageEnd,
            hourly_rate: hourlyRate,
            ot_hourly_rate: otHourlyRate,
            total_working_hours: Number(totalWorkingHours.toFixed(2)),
            total_amount: Number(totalAmount.toFixed(2)),
            invoice_details: transactions.map((transaction) => this.invoiceDetailRepository.create({
                client_id: validatedData.client_id,
                employee_id: transaction.employee_id,
                date: (0, dateUtils_1.toDateString)(transaction.date),
                billed_hours: Number(transaction.working_hours),
                billed_ot_hours: Number(transaction.ot_working_hours || 0),
                remarks: transaction.remarks ?? null,
            })),
        });
        const saved = await this.invoiceRepository.save(invoiceEntity);
        saved.invoice_no = this.generateInvoiceNumber(invoiceDateStr, saved.id);
        await this.invoiceRepository.save(saved);
        return await this.getInvoiceById(saved.id);
    }
    async updateInvoice(idStr, data) {
        const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: String(idStr) });
        const validatedData = InvoiceValidator_1.InvoiceUpdateSchema.parse(data);
        const invoice = await this.getInvoiceById(id);
        if (validatedData.invoice_no &&
            validatedData.invoice_no !== invoice.invoice_no) {
            await this.ensureInvoiceNumberIsUnique(validatedData.invoice_no, id);
            invoice.invoice_no = validatedData.invoice_no;
        }
        if (validatedData.client_id !== undefined) {
            await this.ensureClientExists(validatedData.client_id);
            invoice.client_id = validatedData.client_id;
        }
        if (validatedData.invoice_date) {
            invoice.invoice_date = validatedData.invoice_date;
        }
        if (validatedData.due_date) {
            invoice.due_date = validatedData.due_date;
        }
        if (validatedData.coverage_start) {
            invoice.coverage_start = validatedData.coverage_start;
        }
        if (validatedData.coverage_end) {
            invoice.coverage_end = validatedData.coverage_end;
        }
        if (validatedData.hourly_rate !== undefined) {
            invoice.hourly_rate = validatedData.hourly_rate;
        }
        if (validatedData.ot_hourly_rate !== undefined) {
            invoice.ot_hourly_rate = validatedData.ot_hourly_rate;
        }
        if (validatedData.total_working_hours !== undefined) {
            invoice.total_working_hours = validatedData.total_working_hours;
        }
        if (validatedData.total_amount !== undefined) {
            invoice.total_amount = validatedData.total_amount;
        }
        if (validatedData.invoice_details !== undefined) {
            await this.ensureEmployeesExist(validatedData.invoice_details);
            await this.invoiceDetailRepository.delete({ invoice_id: id });
            invoice.invoice_details = validatedData.invoice_details.map((detail) => this.invoiceDetailRepository.create({
                invoice_id: id,
                client_id: invoice.client_id,
                employee_id: detail.employee_id,
                date: (0, dateUtils_1.toDateString)(detail.date),
                billed_hours: detail.billed_hours,
                billed_ot_hours: detail.billed_ot_hours,
                remarks: detail.remarks ?? null,
            }));
        }
        await this.invoiceRepository.save(invoice);
        return await this.getInvoiceById(id);
    }
    async deleteInvoice(idStr) {
        const { id } = InvoiceValidator_1.InvoiceIdParamSchema.parse({ id: String(idStr) });
        await this.getInvoiceById(id);
        await this.invoiceDetailRepository.delete({ invoice_id: id });
        const result = await this.invoiceRepository.delete(id);
        if ((result.affected ?? 0) === 0) {
            throw new Error("Failed to delete invoice");
        }
    }
    async ensureClientExists(clientId) {
        const client = await this.clientRepository.findOne({
            where: { id: clientId },
        });
        if (!client) {
            throw new exceptions_1.ResourceNotFound(`Client with ID ${clientId} not found`);
        }
    }
    async ensureEmployeesExist(details) {
        const employeeIds = [
            ...new Set(details.map((detail) => detail.employee_id)),
        ];
        if (employeeIds.length === 0) {
            return;
        }
        const employees = await this.employeeRepository.find({
            where: employeeIds.map((employeeId) => ({ id: employeeId })),
            select: ["id"],
        });
        const foundIds = new Set(employees.map((employee) => employee.id));
        const missingIds = employeeIds.filter((employeeId) => !foundIds.has(employeeId));
        if (missingIds.length > 0) {
            throw new exceptions_1.ResourceNotFound(`Employees not found: ${missingIds.join(", ")}`);
        }
    }
    async ensureInvoiceNumberIsUnique(invoiceNo, excludeId) {
        const existing = await this.invoiceRepository.findOne({
            where: { invoice_no: invoiceNo },
            select: ["id", "invoice_no"],
        });
        if (!existing) {
            return;
        }
        if (excludeId && existing.id === excludeId) {
            return;
        }
        throw new exceptions_1.ResourceConflict(`Invoice number ${invoiceNo} already exists`);
    }
    generateTemporaryInvoiceNumber() {
        return `TMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
    generateInvoiceNumber(invoiceDate, id) {
        const [year, month, day] = invoiceDate.split("-");
        const runningId = String(id).padStart(4, "0");
        return `INV-${year}${month}${day}-${runningId}`;
    }
    getCoverageRangeWithDefaults(coverageStart, coverageEnd) {
        if (coverageStart && coverageEnd) {
            return { coverageStart, coverageEnd };
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const defaultStart = this.formatDateOnly(monthStart);
        const defaultEnd = this.formatDateOnly(monthEnd);
        return {
            coverageStart: coverageStart || defaultStart,
            coverageEnd: coverageEnd || defaultEnd,
        };
    }
    formatDateOnly(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
}
exports.default = InvoiceService;
