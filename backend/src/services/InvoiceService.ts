import { AppDataSource } from "../config/AppSourceData";
import { Client } from "../entities/Client";
import { Employee } from "../entities/Employee";
import { EmployeeCustomerTransaction } from "../entities/EmployeeCustomerTransaction";
import { Invoice } from "../entities/Invoice";
import { InvoiceDetail } from "../entities/InvoiceDetail";
import { ResourceConflict, ResourceNotFound } from "../exceptions";
import {
  AdjustmentRequest,
  CreateInvoiceRequest,
  InvoiceSearchQueryInput,
  UpdateInvoiceAdjustmentsRequest,
  UpdateInvoiceRequest,
} from "../types/Invoice";
import {
  InvoiceCreateSchema,
  InvoiceIdParamSchema,
  InvoiceSearchQuerySchema,
  InvoiceUpdateSchema,
} from "../validators/InvoiceValidator";
import { toDateString } from "../utils/dateUtils";
import { InvoiceAdjustment } from "../entities/InvoiceAdjustment";
import { In } from "typeorm";

class InvoiceService {
  private readonly invoiceRepository;
  private readonly invoiceDetailRepository;
  private readonly invoiceAdjustmentRepository;
  private readonly employeeCustomerTransactionRepository;
  private readonly clientRepository;
  private readonly employeeRepository;

  constructor() {
    this.invoiceRepository = AppDataSource.getRepository(Invoice);
    this.invoiceDetailRepository = AppDataSource.getRepository(InvoiceDetail);
    this.employeeCustomerTransactionRepository = AppDataSource.getRepository(
      EmployeeCustomerTransaction,
    );
    this.clientRepository = AppDataSource.getRepository(Client);
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.invoiceAdjustmentRepository =
      AppDataSource.getRepository(InvoiceAdjustment);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      relations: ["client", "invoice_details", "invoice_details.employee"],
      order: { created_at: "DESC" },
    });
  }

  async searchInvoices(query: InvoiceSearchQueryInput): Promise<Invoice[]> {
    const validatedQuery = InvoiceSearchQuerySchema.parse(query);

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

  async getInvoiceById(idStr: string | number): Promise<Invoice> {
    const { id } = InvoiceIdParamSchema.parse({ id: String(idStr) });

    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: [
        "client",
        "invoice_details",
        "invoice_adjustments",
        "invoice_details.employee",
      ],
    });

    if (!invoice) {
      throw new ResourceNotFound(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const validatedData = InvoiceCreateSchema.parse(data);
    const { coverageStart, coverageEnd } = this.getCoverageRangeWithDefaults(
      validatedData.coverage_start,
      validatedData.coverage_end,
    );

    const client = await this.clientRepository.findOne({
      where: { id: validatedData.client_id },
      select: ["id", "hourly_rate", "ot_hourly_rate"],
    });

    if (!client) {
      throw new ResourceNotFound(
        `Client with ID ${validatedData.client_id} not found`,
      );
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
      throw new ResourceNotFound(
        "No employee-customer transactions found for the selected client and coverage period",
      );
    }

    const hourlyRate = Number(client.hourly_rate);
    const otHourlyRate = Number(client.ot_hourly_rate || 0);
    const totalWorkingHours = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.working_hours),
      0,
    );
    const totalOtWorkingHours = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.ot_working_hours || 0),
      0,
    );
    const totalAmount =
      hourlyRate * totalWorkingHours + otHourlyRate * totalOtWorkingHours;
    const invoiceDateStr = validatedData.invoice_date
      ? validatedData.invoice_date
      : this.formatDateOnly(new Date());
    const dueDateStr = validatedData.due_date
      ? validatedData.due_date
      : this.formatDateOnly(new Date());

    const invoiceEntity = this.invoiceRepository.create({
      invoice_no: this.generateTemporaryInvoiceNumber(),
      client_id: validatedData.client_id,
      invoice_date: invoiceDateStr as unknown as Date,
      due_date: dueDateStr as unknown as Date,
      coverage_start: coverageStart as unknown as Date,
      coverage_end: coverageEnd as unknown as Date,
      hourly_rate: hourlyRate,
      ot_hourly_rate: otHourlyRate,
      total_working_hours: Number(totalWorkingHours.toFixed(4)),
      total_ot_working_hours: Number(totalOtWorkingHours.toFixed(4)),
      total_amount: Number(totalAmount.toFixed(4)),
      total_additions: 0,
      total_deductions: 0,
      grand_total: Number(totalAmount.toFixed(4)),
      invoice_details: transactions.map((transaction) =>
        this.invoiceDetailRepository.create({
          client_id: validatedData.client_id,
          employee_id: transaction.employee_id,
          date: toDateString(
            transaction.date as unknown as Date | string,
          ) as unknown as Date,
          billed_hours: Number(transaction.working_hours),
          billed_ot_hours: Number(transaction.ot_working_hours || 0),
          remarks: transaction.remarks ?? null,
        }),
      ),
    });

    const saved = await this.invoiceRepository.save(invoiceEntity);
    saved.invoice_no = this.generateInvoiceNumber(invoiceDateStr, saved.id);
    await this.invoiceRepository.save(saved);

    return await this.getInvoiceById(saved.id);
  }

  async updateInvoice(
    idStr: string | number,
    data: UpdateInvoiceRequest,
  ): Promise<Invoice> {
    const { id } = InvoiceIdParamSchema.parse({ id: String(idStr) });
    const validatedData = InvoiceUpdateSchema.parse(data);

    const invoice = await this.getInvoiceById(id);

    if (
      validatedData.invoice_no &&
      validatedData.invoice_no !== invoice.invoice_no
    ) {
      await this.ensureInvoiceNumberIsUnique(validatedData.invoice_no, id);
      invoice.invoice_no = validatedData.invoice_no;
    }

    if (validatedData.client_id !== undefined) {
      await this.ensureClientExists(validatedData.client_id);
      invoice.client_id = validatedData.client_id;
    }

    if (validatedData.invoice_date) {
      invoice.invoice_date = validatedData.invoice_date as unknown as Date;
    }

    if (validatedData.due_date) {
      invoice.due_date = validatedData.due_date as unknown as Date;
    }

    if (validatedData.coverage_start) {
      invoice.coverage_start = validatedData.coverage_start as unknown as Date;
    }

    if (validatedData.coverage_end) {
      invoice.coverage_end = validatedData.coverage_end as unknown as Date;
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

      invoice.invoice_details = validatedData.invoice_details.map((detail) =>
        this.invoiceDetailRepository.create({
          invoice_id: id,
          client_id: invoice.client_id,
          employee_id: detail.employee_id,
          date: toDateString(detail.date) as unknown as Date,
          billed_hours: detail.billed_hours,
          billed_ot_hours: detail.billed_ot_hours,
          remarks: detail.remarks ?? null,
        }),
      );
    }

    await this.invoiceRepository.save(invoice);
    return await this.getInvoiceById(id);
  }

  async updateInvoiceAdjustments(
    data: UpdateInvoiceAdjustmentsRequest,
  ): Promise<Invoice> {
    const result = await AppDataSource.transaction(async (manager) => {
      const invoiceRepo = manager.getRepository(Invoice);
      const invoiceAdjRepo = manager.getRepository(InvoiceAdjustment);

      // check if invoice exists
      const invoice = await invoiceRepo.findOne({
        where: { id: data.invoice_id },
      });

      if (!invoice) {
        throw new ResourceNotFound(
          `Invoice with ID ${data.invoice_id} not found`,
        );
      }

      // process adjustments
      const itemsToDelete: number[] = [];
      const adjustmentsToSave: InvoiceAdjustment[] = [];
      const adjustmentIds = data.adjustments
        .filter((adj) => adj.id)
        .map((adj) => adj.id!) as number[];
      const existingAdjustments = (
        adjustmentIds.length
          ? await invoiceAdjRepo.find({
              where: { id: In(adjustmentIds) },
            })
          : []
      ).reduce(
        (map, adj) => {
          map[adj.id] = adj;
          return map;
        },
        {} as Record<number, InvoiceAdjustment>,
      );

      for (const adjustment of data.adjustments) {
        if (adjustment.is_deleted && adjustment.id) {
          itemsToDelete.push(adjustment.id);
          continue;
        }

        if (adjustment.id) {
          const invoiceAdj = existingAdjustments[adjustment.id];
          if (invoiceAdj) {
            invoiceAdj.type = adjustment.type;
            invoiceAdj.description = adjustment.description;
            invoiceAdj.quantity = adjustment.quantity;
            invoiceAdj.price = adjustment.price;
            invoiceAdj.total = adjustment.quantity * adjustment.price;
            invoiceAdj.sort = adjustment.sort;
            adjustmentsToSave.push(invoiceAdj);
          } else {
            console.error(
              `Invoice adjustment with ID ${adjustment.id} not found for update`,
            );
            throw new ResourceNotFound(
              `Invoice adjustment with ID ${adjustment.id} not found`,
            );
          }
        } else {
          adjustmentsToSave.push(
            invoiceAdjRepo.create({
              invoice_id: data.invoice_id,
              type: adjustment.type,
              description: adjustment.description,
              quantity: adjustment.quantity,
              price: adjustment.price,
              total: adjustment.quantity * adjustment.price,
              sort: adjustment.sort,
            }),
          );
        }
      }

      if (itemsToDelete.length > 0) {
        await invoiceAdjRepo.delete(itemsToDelete);
      }

      if (adjustmentsToSave.length > 0) {
        await invoiceAdjRepo.save(adjustmentsToSave);
      }

      // process invoice totals
      const newAdjustments = await invoiceAdjRepo.find({
        where: { invoice_id: data.invoice_id },
      });
      const total_additions = this.calculateTotalAdjustment(
        newAdjustments,
        "ADDITIONAL",
      );
      const total_deductions = this.calculateTotalAdjustment(
        newAdjustments,
        "DEDUCTION",
      );

      invoice.total_additions = total_additions;
      invoice.total_deductions = total_deductions;
      invoice.grand_total =
        invoice.total_amount + total_additions - total_deductions;

      const savedInvoice = await invoiceRepo.save(invoice);

      return savedInvoice;
    });

    return this.getInvoiceById(result.id);
  }

  async deleteInvoice(idStr: string | number): Promise<void> {
    const { id } = InvoiceIdParamSchema.parse({ id: String(idStr) });

    await this.getInvoiceById(id);

    await this.invoiceDetailRepository.delete({ invoice_id: id });

    await this.invoiceAdjustmentRepository.delete({ invoice_id: id });

    const result = await this.invoiceRepository.delete(id);
    if ((result.affected ?? 0) === 0) {
      throw new Error("Failed to delete invoice");
    }
  }

  private async ensureClientExists(clientId: number): Promise<void> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) {
      throw new ResourceNotFound(`Client with ID ${clientId} not found`);
    }
  }

  private async ensureEmployeesExist(
    details: Array<{ employee_id: number }>,
  ): Promise<void> {
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
    const missingIds = employeeIds.filter(
      (employeeId) => !foundIds.has(employeeId),
    );

    if (missingIds.length > 0) {
      throw new ResourceNotFound(
        `Employees not found: ${missingIds.join(", ")}`,
      );
    }
  }

  private async ensureInvoiceNumberIsUnique(
    invoiceNo: string,
    excludeId?: number,
  ): Promise<void> {
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

    throw new ResourceConflict(`Invoice number ${invoiceNo} already exists`);
  }

  private generateTemporaryInvoiceNumber(): string {
    return `TMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  private generateInvoiceNumber(invoiceDate: string, id: number): string {
    const [year, month, day] = invoiceDate.split("-");
    const runningId = String(id).padStart(4, "0");
    return `INV-${year}${month}${day}-${runningId}`;
  }

  private getCoverageRangeWithDefaults(
    coverageStart?: string,
    coverageEnd?: string,
  ): { coverageStart: string; coverageEnd: string } {
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

  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private calculateTotalAdjustment(
    adjustments: InvoiceAdjustment[],
    type: string,
  ) {
    return adjustments
      .filter((adjustments) => adjustments.type === type)
      .reduce((acc, prev) => acc + prev.price * prev.quantity, 0);
  }
}

export default InvoiceService;
