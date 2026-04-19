import { z } from "zod";

const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .transform((dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return dateStr;
  });

export const InvoiceDetailCreateSchema = z.object({
  employee_id: z
    .number()
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive integer"),
  date: DateStringSchema,
  billed_hours: z.number().positive("Billed hours must be a positive number"),
  billed_ot_hours: z
    .number()
    .nonnegative("Billed OT hours must be a non-negative number"),
  remarks: z
    .string()
    .max(500, "Remarks must not exceed 500 characters")
    .trim()
    .nullable()
    .optional()
    .default(null),
});

export const InvoiceCreateSchema = z
  .object({
    client_id: z
      .number()
      .int("Client ID must be an integer")
      .positive("Client ID must be a positive integer"),
    invoice_date: DateStringSchema.optional(),
    due_date: DateStringSchema.optional(),
    coverage_start: DateStringSchema.optional(),
    coverage_end: DateStringSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.coverage_start || !data.coverage_end) {
        return true;
      }

      return (
        new Date(data.coverage_start).getTime() <=
        new Date(data.coverage_end).getTime()
      );
    },
    {
      message: "coverage_start must be less than or equal to coverage_end",
      path: ["coverage_start"],
    },
  );

export const InvoiceDetailUpdateSchema = z
  .object({
    employee_id: z
      .number()
      .int("Employee ID must be an integer")
      .positive("Employee ID must be a positive integer"),
    date: DateStringSchema,
    billed_hours: z.number().positive("Billed hours must be a positive number"),
    billed_ot_hours: z
      .number()
      .nonnegative("Billed OT hours must be a non-negative number"),
    remarks: z
      .string()
      .max(500, "Remarks must not exceed 500 characters")
      .trim()
      .nullable()
      .optional()
      .default(null),
  })
  .strict();

export const InvoiceUpdateSchema = z
  .object({
    invoice_no: z
      .string()
      .min(1, "Invoice number cannot be empty")
      .max(100, "Invoice number must not exceed 100 characters")
      .trim()
      .optional(),
    client_id: z
      .number()
      .int("Client ID must be an integer")
      .positive("Client ID must be a positive integer")
      .optional(),
    invoice_date: DateStringSchema.optional(),
    due_date: DateStringSchema.optional(),
    coverage_start: DateStringSchema.optional(),
    coverage_end: DateStringSchema.optional(),
    hourly_rate: z
      .number()
      .nonnegative("Hourly rate must be non-negative")
      .optional(),
    ot_hourly_rate: z
      .number()
      .nonnegative("OT hourly rate must be non-negative")
      .optional(),
    total_working_hours: z
      .number()
      .nonnegative("Total working hours must be non-negative")
      .optional(),
    total_amount: z
      .number()
      .nonnegative("Total amount must be non-negative")
      .optional(),
    invoice_details: z.array(InvoiceDetailUpdateSchema).optional(),
  })
  .strict()
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined && value !== null,
      ),
    {
      message: "At least one field must be provided for update",
    },
  )
  .refine(
    (data) => {
      if (!data.coverage_start || !data.coverage_end) {
        return true;
      }

      return (
        new Date(data.coverage_start).getTime() <=
        new Date(data.coverage_end).getTime()
      );
    },
    {
      message: "coverage_start must be less than or equal to coverage_end",
      path: ["coverage_start"],
    },
  );

export const InvoiceIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Invoice ID must be a valid number")
    .transform(Number),
});

export const InvoiceSearchQuerySchema = z
  .object({
    invoice_no: z.string().trim().min(1).optional(),
    client_id: z.coerce
      .number()
      .int("Client ID must be an integer")
      .positive("Client ID must be a positive integer")
      .optional(),
    invoice_date: DateStringSchema.optional(),
    invoice_date_from: DateStringSchema.optional(),
    invoice_date_to: DateStringSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (!data.invoice_date_from || !data.invoice_date_to) {
        return true;
      }

      return (
        new Date(data.invoice_date_from).getTime() <=
        new Date(data.invoice_date_to).getTime()
      );
    },
    {
      message:
        "invoice_date_from must be less than or equal to invoice_date_to",
      path: ["invoice_date_from"],
    },
  )
  .refine(
    (data) =>
      data.invoice_no !== undefined ||
      data.client_id !== undefined ||
      data.invoice_date !== undefined ||
      data.invoice_date_from !== undefined ||
      data.invoice_date_to !== undefined,
    {
      message:
        "At least one query filter is required: invoice_no, client_id, invoice_date, invoice_date_from, or invoice_date_to",
    },
  );

export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof InvoiceUpdateSchema>;
export type InvoiceIdParam = z.infer<typeof InvoiceIdParamSchema>;
export type InvoiceSearchQueryInput = z.infer<typeof InvoiceSearchQuerySchema>;
