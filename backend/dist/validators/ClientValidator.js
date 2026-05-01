"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientIdParamSchema = exports.ClientUpdateSchema = exports.ClientCreateSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod validation schemas for Client entity
 * Provides compile-time and runtime type safety
 */
/**
 * Schema for creating a new client
 * All required fields must be provided
 */
exports.ClientCreateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Client name is required")
        .max(150, "Name must not exceed 150 characters")
        .trim(),
    owner: zod_1.z
        .string()
        .min(1, "Client owner is required")
        .max(150, "Owner must not exceed 150 characters")
        .trim(),
    address1: zod_1.z
        .string()
        .min(1, "Address 1 is required")
        .max(255, "Address 1 must not exceed 255 characters")
        .trim(),
    address2: zod_1.z
        .string()
        .max(255, "Address 2 must not exceed 255 characters")
        .trim()
        .nullable()
        .optional()
        .default(null),
    hourly_rate: zod_1.z
        .number()
        .nonnegative("Hourly rate must be a non-negative number"),
    ot_hourly_rate: zod_1.z
        .number()
        .nonnegative("OT working hours rate must be a non-negative number"),
    status: zod_1.z.enum(["active", "inactive"]).default("active"),
});
/**
 * Schema for updating a client
 * All fields are optional for partial updates
 */
exports.ClientUpdateSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .min(1, "Client name cannot be empty")
        .max(150, "Name must not exceed 150 characters")
        .trim()
        .optional(),
    owner: zod_1.z
        .string()
        .min(1, "Client owner cannot be empty")
        .max(150, "Owner must not exceed 150 characters")
        .trim()
        .optional(),
    address1: zod_1.z
        .string()
        .min(1, "Address 1 cannot be empty")
        .max(255, "Address 1 must not exceed 255 characters")
        .trim()
        .optional(),
    address2: zod_1.z
        .string()
        .max(255, "Address 2 must not exceed 255 characters")
        .trim()
        .nullable()
        .optional(),
    hourly_rate: zod_1.z
        .number()
        .nonnegative("Hourly rate must be a non-negative number")
        .optional(),
    ot_hourly_rate: zod_1.z
        .number()
        .nonnegative("OT working hours rate must be a non-negative number")
        .optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, "At least one field must be provided for update");
/**
 * Schema for validating client ID in URL parameters
 */
exports.ClientIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .regex(/^\d+$/, "Client ID must be a valid number")
        .transform(Number),
});
