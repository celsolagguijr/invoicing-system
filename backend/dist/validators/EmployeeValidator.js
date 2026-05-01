"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeIdParamSchema = exports.EmployeeUpdateSchema = exports.EmployeeCreateSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod validation schemas for Employee entity
 * Provides compile-time and runtime type safety
 */
/**
 * Schema for creating a new employee
 * All required fields must be provided
 */
exports.EmployeeCreateSchema = zod_1.z.object({
    employee_no: zod_1.z
        .string()
        .min(1, "Employee number is required")
        .max(100, "Employee number must not exceed 100 characters")
        .trim(),
    employee_name: zod_1.z
        .string()
        .min(1, "Employee name is required")
        .max(255, "Employee name must not exceed 255 characters")
        .trim(),
    date_of_birth: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/, "Date of birth must be in YYYY-MM-DD or MM/DD/YYYY format")
        .transform((dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        return dateStr;
    }),
    status: zod_1.z.enum(["active", "inactive"]).default("active"),
});
/**
 * Schema for updating an employee
 * All fields are optional for partial updates
 */
exports.EmployeeUpdateSchema = zod_1.z
    .object({
    employee_no: zod_1.z
        .string()
        .min(1, "Employee number cannot be empty")
        .max(100, "Employee number must not exceed 100 characters")
        .trim()
        .optional(),
    employee_name: zod_1.z
        .string()
        .min(1, "Employee name cannot be empty")
        .max(255, "Employee name must not exceed 255 characters")
        .trim()
        .optional(),
    date_of_birth: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{4}$/, "Date of birth must be in YYYY-MM-DD or MM/DD/YYYY format")
        .transform((dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        return dateStr;
    })
        .optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, "At least one field must be provided for update");
/**
 * Schema for validating employee ID in URL parameters
 */
exports.EmployeeIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .regex(/^\d+$/, "Employee ID must be a valid number")
        .transform(Number),
});
