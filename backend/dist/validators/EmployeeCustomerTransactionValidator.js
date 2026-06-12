"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeCustomerTransactionDateRangeQuerySchema = exports.EmployeeCustomerTransactionIdParamSchema = exports.EmployeeCustomerTransactionUpdateSchema = exports.EmployeeCustomerTransactionBatchCreateSchema = exports.EmployeeCustomerTransactionCreateSchema = void 0;
const zod_1 = require("zod");
function normalizeDateKey(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    const [month, day, year] = dateStr.split("/");
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
/**
 * Zod validation schemas for EmployeeCustomerTransaction entity
 * Provides compile-time and runtime type safety
 */
/**
 * Schema for creating a new employee-customer transaction
 * All required fields must be provided
 */
exports.EmployeeCustomerTransactionCreateSchema = zod_1.z.object({
    employee_id: zod_1.z
        .number()
        .int("Employee ID must be an integer")
        .positive("Employee ID must be a positive integer"),
    customer_id: zod_1.z
        .number()
        .int("Customer ID must be an integer")
        .positive("Customer ID must be a positive integer"),
    working_hours: zod_1.z
        .number()
        .nonnegative("OT working hours must be a non-negative number"),
    ot_working_hours: zod_1.z
        .number()
        .nonnegative("OT working hours must be a non-negative number"),
    date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/, "Date must be in YYYY-MM-DD or MM/DD/YYYY format")
        .transform((dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        return dateStr;
    }),
    remarks: zod_1.z
        .string()
        .max(500, "Remarks must not exceed 500 characters")
        .trim()
        .nullable()
        .optional()
        .default(null),
});
/**
 * Schema for batch creating multiple employee-customer transactions
 * Array of transaction objects with all required fields
 */
exports.EmployeeCustomerTransactionBatchCreateSchema = zod_1.z
    .array(exports.EmployeeCustomerTransactionCreateSchema)
    .min(1, "At least one transaction is required for batch creation")
    .max(1000, "Maximum 1000 transactions per batch")
    .superRefine((transactions, ctx) => {
    const seen = new Map();
    transactions.forEach((transaction, index) => {
        const normalizedDate = normalizeDateKey(transaction.date);
        const key = `${transaction.employee_id}:${transaction.customer_id}:${normalizedDate}`;
        if (seen.has(key)) {
            const firstIndex = seen.get(key);
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Duplicate timelog in batch for the same employee_id, company_id/customer_id and date",
                path: [index],
            });
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Duplicate timelog in batch for the same employee_id, company_id/customer_id and date",
                path: [firstIndex],
            });
            return;
        }
        seen.set(key, index);
    });
});
/**
 * Schema for updating an employee-customer transaction
 * All fields are optional for partial updates
 */
exports.EmployeeCustomerTransactionUpdateSchema = zod_1.z
    .object({
    employee_id: zod_1.z
        .number()
        .int("Employee ID must be an integer")
        .positive("Employee ID must be a positive integer")
        .optional(),
    customer_id: zod_1.z
        .number()
        .int("Customer ID must be an integer")
        .positive("Customer ID must be a positive integer")
        .optional(),
    working_hours: zod_1.z
        .number()
        .nonnegative("OT working hours must be a non-negative number")
        .optional(),
    ot_working_hours: zod_1.z
        .number()
        .nonnegative("OT working hours must be a non-negative number")
        .optional(),
    date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/, "Date must be in YYYY-MM-DD or MM/DD/YYYY format")
        .transform((dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        return dateStr;
    })
        .optional(),
    remarks: zod_1.z
        .string()
        .max(500, "Remarks must not exceed 500 characters")
        .trim()
        .nullable()
        .optional(),
})
    .strict("No unknown fields allowed")
    .refine((data) => Object.values(data).some((value) => value !== undefined && value !== null), {
    message: "At least one field must be provided for update",
});
/**
 * Schema for ID parameter validation
 * Validates transaction ID from URL parameters
 */
exports.EmployeeCustomerTransactionIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .regex(/^\d+$/, "ID must be a positive integer")
        .transform((id) => parseInt(id, 10)),
});
/**
 * Schema for date range query validation
 * Validates start and end dates from URL query parameters
 */
exports.EmployeeCustomerTransactionDateRangeQuerySchema = zod_1.z
    .object({
    start_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "start_date must be in YYYY-MM-DD format",
    }),
    end_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "end_date must be in YYYY-MM-DD format",
    }),
    employee_id: zod_1.z
        .preprocess((value) => value === undefined || value === "" ? undefined : Number(value), zod_1.z
        .number()
        .int("employee_id must be an integer")
        .positive("employee_id must be a positive integer")
        .optional())
        .optional(),
    client_id: zod_1.z
        .preprocess((value) => value === undefined || value === "" ? undefined : Number(value), zod_1.z
        .number()
        .int("client_id must be an integer")
        .positive("client_id must be a positive integer")
        .optional())
        .optional(),
})
    .refine((data) => new Date(data.start_date).getTime() <= new Date(data.end_date).getTime(), {
    message: "start_date must be less than or equal to end_date",
    path: ["start_date"],
});
