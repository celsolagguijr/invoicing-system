import { AppDataSource } from "../config/AppSourceData";
import { EmployeeCustomerTransaction } from "../entities/EmployeeCustomerTransaction";
import { Employee } from "../entities/Employee";
import { Client } from "../entities/Client";
import { ResourceNotFound, StructuredApiError } from "../exceptions";
import {
  CreateEmployeeCustomerTransactionRequest,
  UpdateEmployeeCustomerTransactionRequest,
  CreateEmployeeCustomerTransactionBatchRequest,
  EmployeeCustomerTransactionDateRangeQueryRequest,
} from "../types/EmployeeCustomerTransaction";
import {
  EmployeeCustomerTransactionCreateSchema,
  EmployeeCustomerTransactionBatchCreateSchema,
  EmployeeCustomerTransactionUpdateSchema,
  EmployeeCustomerTransactionIdParamSchema,
  EmployeeCustomerTransactionDateRangeQuerySchema,
} from "../validators/EmployeeCustomerTransactionValidator";
import { toDateString } from "../utils/dateUtils";

class EmployeeCustomerTransactionService {
  private readonly transactionRepository;
  private readonly employeeRepository;
  private readonly clientRepository;

  constructor() {
    this.transactionRepository = AppDataSource.getRepository(
      EmployeeCustomerTransaction,
    );
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.clientRepository = AppDataSource.getRepository(Client);
  }

  private normalizeDateKey(dateStr: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    const [month, day, year] = dateStr.split("/");
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  async getAllTransactions(): Promise<EmployeeCustomerTransaction[]> {
    return await this.transactionRepository.find({
      relations: ["employee", "customer"],
    });
  }

  async getTransactionsByDateRange(
    query: EmployeeCustomerTransactionDateRangeQueryRequest,
  ): Promise<EmployeeCustomerTransaction[]> {
    const validatedQuery =
      EmployeeCustomerTransactionDateRangeQuerySchema.parse(query);

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

  async getTransactionById(
    idStr: string | number,
  ): Promise<EmployeeCustomerTransaction> {
    // Validate ID with Zod
    const { id } = EmployeeCustomerTransactionIdParamSchema.parse({
      id: String(idStr),
    });

    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ["employee", "customer"],
    });
    if (!transaction) throw new ResourceNotFound("Transaction not found");
    return transaction;
  }

  async createTransaction(
    data: CreateEmployeeCustomerTransactionRequest,
  ): Promise<EmployeeCustomerTransaction> {
    // Validate with Zod schema
    const validatedData = EmployeeCustomerTransactionCreateSchema.parse(data);

    // Verify employee exists
    const employee = await this.employeeRepository.findOne({
      where: { id: validatedData.employee_id },
    });
    if (!employee) {
      throw new ResourceNotFound("Employee not found");
    }

    // Verify client exists
    const client = await this.clientRepository.findOne({
      where: { id: validatedData.customer_id },
    });
    if (!client) {
      throw new ResourceNotFound("Client not found");
    }

    const newTransaction = this.transactionRepository.create({
      employee_id: validatedData.employee_id,
      customer_id: validatedData.customer_id,
      working_hours: validatedData.working_hours,
      ot_working_hours: validatedData.ot_working_hours,
      date: toDateString(validatedData.date) as unknown as Date,
      remarks: validatedData.remarks ?? null,
    });
    return await this.transactionRepository.save(newTransaction);
  }

  async createBatchTransactions(
    data: CreateEmployeeCustomerTransactionBatchRequest,
  ): Promise<EmployeeCustomerTransaction[]> {
    // Validate batch data with Zod schema
    const validatedTransactions =
      EmployeeCustomerTransactionBatchCreateSchema.parse(data.transactions);

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
    const missingEmployeeIds = uniqueEmployeeIds.filter(
      (id) => !employeeIdSet.has(id),
    );
    if (missingEmployeeIds.length > 0) {
      throw new ResourceNotFound(
        `Employees not found: ${missingEmployeeIds.join(", ")}`,
      );
    }

    // Verify all clients exist
    const clients = await this.clientRepository.find({
      where: uniqueCustomerIds.map((id) => ({ id })),
    });
    const clientIdSet = new Set(clients.map((c) => c.id));
    const missingClientIds = uniqueCustomerIds.filter(
      (id) => !clientIdSet.has(id),
    );
    if (missingClientIds.length > 0) {
      throw new ResourceNotFound(
        `Clients not found: ${missingClientIds.join(", ")}`,
      );
    }

    const employeeNameById = new Map(
      employees.map((employee) => [employee.id, employee.employee_name]),
    );
    const clientNameById = new Map(
      clients.map((client) => [client.id, client.name]),
    );

    const existingTransactions = await this.transactionRepository.find({
      where: uniqueEmployeeIds.flatMap((employeeId) =>
        uniqueCustomerIds.map((customerId) => ({
          employee_id: employeeId,
          customer_id: customerId,
        })),
      ),
      select: ["employee_id", "customer_id", "date"],
    });

    const existingKeys = new Set(
      existingTransactions.map((t) => {
        const date =
          t.date instanceof Date
            ? t.date.toISOString().slice(0, 10)
            : String(t.date).slice(0, 10);
        return `${t.employee_id}:${t.customer_id}:${date}`;
      }),
    );

    const duplicatedAgainstDb = validatedTransactions.flatMap(
      (transaction, index) => {
        const normalizedDate = this.normalizeDateKey(transaction.date);
        const key = `${transaction.employee_id}:${transaction.customer_id}:${normalizedDate}`;

        if (!existingKeys.has(key)) {
          return [];
        }

        const employeeName =
          employeeNameById.get(transaction.employee_id) ||
          `Employee ${transaction.employee_id}`;
        const clientName =
          clientNameById.get(transaction.customer_id) ||
          `Client ${transaction.customer_id}`;

        return [
          {
            path: `Transactions > Row ${index + 1}`,
            client: clientName,
            employee: employeeName,
            message: `Duplicate timelog already exists in past timelogs for employee ${employeeName} and client ${clientName} on ${normalizedDate}.`,
          },
        ];
      },
    );

    if (duplicatedAgainstDb.length > 0) {
      throw new StructuredApiError(
        "Duplicate timelog already exists in past timelogs for one or more rows.",
        duplicatedAgainstDb,
      );
    }

    // Create transaction entities
    const transactions = validatedTransactions.map((t) =>
      this.transactionRepository.create({
        employee_id: t.employee_id,
        customer_id: t.customer_id,
        working_hours: t.working_hours,
        ot_working_hours: t.ot_working_hours,
        date: toDateString(t.date) as unknown as Date,
        remarks: t.remarks ?? null,
      }),
    );

    // Save all transactions at once
    const savedTransactions =
      await this.transactionRepository.save(transactions);

    // Reload with relations
    return await Promise.all(
      savedTransactions.map((t) => this.getTransactionById(t.id)),
    );
  }

  async updateTransaction(
    idStr: string | number,
    data: UpdateEmployeeCustomerTransactionRequest,
  ): Promise<EmployeeCustomerTransaction> {
    // Validate ID with Zod
    const { id } = EmployeeCustomerTransactionIdParamSchema.parse({
      id: String(idStr),
    });

    const transaction = await this.getTransactionById(id);

    // Validate update data with Zod schema
    const validatedData = EmployeeCustomerTransactionUpdateSchema.parse(data);

    // Verify employee exists if being updated
    if (validatedData.employee_id) {
      const employee = await this.employeeRepository.findOne({
        where: { id: validatedData.employee_id },
      });
      if (!employee) {
        throw new ResourceNotFound("Employee not found");
      }
    }

    // Verify client exists if being updated
    if (validatedData.customer_id) {
      const client = await this.clientRepository.findOne({
        where: { id: validatedData.customer_id },
      });
      if (!client) {
        throw new ResourceNotFound("Client not found");
      }
    }

    const updateData: Partial<EmployeeCustomerTransaction> = {};
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
      updateData.date = toDateString(validatedData.date) as unknown as Date;
    }
    if (validatedData.remarks !== undefined) {
      updateData.remarks = validatedData.remarks;
    }

    await this.transactionRepository.update(id, updateData);
    return await this.getTransactionById(id);
  }

  async deleteTransaction(idStr: string | number): Promise<void> {
    // Validate ID with Zod
    const { id } = EmployeeCustomerTransactionIdParamSchema.parse({
      id: String(idStr),
    });

    await this.getTransactionById(id);
    const result = await this.transactionRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new Error("Failed to delete transaction");
    }
  }
}

export default EmployeeCustomerTransactionService;
