"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceSearchQuerySchema = exports.InvoiceIdParamSchema = exports.InvoiceUpdateSchema = exports.InvoiceDetailUpdateSchema = exports.InvoiceCreateSchema = exports.InvoiceDetailCreateSchema = void 0;
const zod_1 = require("zod");
const DateStringSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .transform((dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    return dateStr;
});
exports.InvoiceDetailCreateSchema = zod_1.z.object({
    employee_id: zod_1.z
        .number()
        .int("Employee ID must be an integer")
        .positive("Employee ID must be a positive integer"),
    date: DateStringSchema,
    billed_hours: zod_1.z.number().positive("Billed hours must be a positive number"),
    billed_ot_hours: zod_1.z
        .number()
        .nonnegative("Billed OT hours must be a non-negative number"),
    remarks: zod_1.z
        .string()
        .max(500, "Remarks must not exceed 500 characters")
        .trim()
        .nullable()
        .optional()
        .default(null),
});
exports.InvoiceCreateSchema = zod_1.z
    .object({
    client_id: zod_1.z
        .number()
        .int("Client ID must be an integer")
        .positive("Client ID must be a positive integer"),
    invoice_date: DateStringSchema.optional(),
    due_date: DateStringSchema.optional(),
    coverage_start: DateStringSchema.optional(),
    coverage_end: DateStringSchema.optional(),
})
    .strict()
    .refine((data) => {
    if (!data.coverage_start || !data.coverage_end) {
        return true;
    }
    return (new Date(data.coverage_start).getTime() <=
        new Date(data.coverage_end).getTime());
}, {
    message: "coverage_start must be less than or equal to coverage_end",
    path: ["coverage_start"],
});
exports.InvoiceDetailUpdateSchema = zod_1.z
    .object({
    employee_id: zod_1.z
        .number()
        .int("Employee ID must be an integer")
        .positive("Employee ID must be a positive integer"),
    date: DateStringSchema,
    billed_hours: zod_1.z.number().positive("Billed hours must be a positive number"),
    billed_ot_hours: zod_1.z
        .number()
        .nonnegative("Billed OT hours must be a non-negative number"),
    remarks: zod_1.z
        .string()
        .max(500, "Remarks must not exceed 500 characters")
        .trim()
        .nullable()
        .optional()
        .default(null),
})
    .strict();
exports.InvoiceUpdateSchema = zod_1.z
    .object({
    invoice_no: zod_1.z
        .string()
        .min(1, "Invoice number cannot be empty")
        .max(100, "Invoice number must not exceed 100 characters")
        .trim()
        .optional(),
    client_id: zod_1.z
        .number()
        .int("Client ID must be an integer")
        .positive("Client ID must be a positive integer")
        .optional(),
    invoice_date: DateStringSchema.optional(),
    due_date: DateStringSchema.optional(),
    coverage_start: DateStringSchema.optional(),
    coverage_end: DateStringSchema.optional(),
    hourly_rate: zod_1.z
        .number()
        .nonnegative("Hourly rate must be non-negative")
        .optional(),
    ot_hourly_rate: zod_1.z
        .number()
        .nonnegative("OT hourly rate must be non-negative")
        .optional(),
    total_working_hours: zod_1.z
        .number()
        .nonnegative("Total working hours must be non-negative")
        .optional(),
    total_amount: zod_1.z
        .number()
        .nonnegative("Total amount must be non-negative")
        .optional(),
    invoice_details: zod_1.z.array(exports.InvoiceDetailUpdateSchema).optional(),
})
    .strict()
    .refine((data) => Object.values(data).some((value) => value !== undefined && value !== null), {
    message: "At least one field must be provided for update",
})
    .refine((data) => {
    if (!data.coverage_start || !data.coverage_end) {
        return true;
    }
    return (new Date(data.coverage_start).getTime() <=
        new Date(data.coverage_end).getTime());
}, {
    message: "coverage_start must be less than or equal to coverage_end",
    path: ["coverage_start"],
});
exports.InvoiceIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .regex(/^\d+$/, "Invoice ID must be a valid number")
        .transform(Number),
});
exports.InvoiceSearchQuerySchema = zod_1.z
    .object({
    invoice_no: zod_1.z.string().trim().min(1).optional(),
    client_id: zod_1.z.coerce
        .number()
        .int("Client ID must be an integer")
        .positive("Client ID must be a positive integer")
        .optional(),
    invoice_date: DateStringSchema.optional(),
    invoice_date_from: DateStringSchema.optional(),
    invoice_date_to: DateStringSchema.optional(),
})
    .strict()
    .refine((data) => {
    if (!data.invoice_date_from || !data.invoice_date_to) {
        return true;
    }
    return (new Date(data.invoice_date_from).getTime() <=
        new Date(data.invoice_date_to).getTime());
}, {
    message: "invoice_date_from must be less than or equal to invoice_date_to",
    path: ["invoice_date_from"],
})
    .refine((data) => data.invoice_no !== undefined ||
    data.client_id !== undefined ||
    data.invoice_date !== undefined ||
    data.invoice_date_from !== undefined ||
    data.invoice_date_to !== undefined, {
    message: "At least one query filter is required: invoice_no, client_id, invoice_date, invoice_date_from, or invoice_date_to",
});
