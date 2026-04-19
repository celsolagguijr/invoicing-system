"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const ResourceNotFound_1 = __importDefault(require("../exceptions/ResourceNotFound"));
const InvalidCredentials_1 = __importDefault(require("../exceptions/InvalidCredentials"));
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const InvalidParams_1 = __importDefault(require("../exceptions/InvalidParams"));
const ResourceConflict_1 = __importDefault(require("../exceptions/ResourceConflict"));
const logger_1 = __importDefault(require("../config/logger"));
const prettifyPathSegment = (segment) => {
    if (typeof segment === "number") {
        return `row ${segment + 1}`;
    }
    return segment
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};
const formatZodIssues = (issues) => {
    return issues.map((issue) => {
        const rowSegment = issue.path.find((segment) => typeof segment === "number");
        const fieldSegment = [...issue.path]
            .reverse()
            .find((segment) => typeof segment === "string");
        const prettyPath = issue.path.length
            ? issue.path.map(prettifyPathSegment).join(" > ")
            : "General";
        return {
            path: prettyPath,
            row: typeof rowSegment === "number" ? rowSegment + 1 : null,
            field: typeof fieldSegment === "string" ? fieldSegment : null,
            message: issue.message,
        };
    });
};
function handleErrors(ErrorInstance) {
    if (ErrorInstance instanceof InvalidCredentials_1.default) {
        logger_1.default.warn("Authentication Error", { message: ErrorInstance.message });
        return {
            message: ErrorInstance.message,
            success: false,
            data: null,
            error: null,
            status: HttpStatus_1.default.BAD_REQUEST,
        };
    }
    if (ErrorInstance instanceof ResourceNotFound_1.default) {
        logger_1.default.warn("Resource Not Found", { message: ErrorInstance.message });
        return {
            message: ErrorInstance.message,
            success: false,
            data: null,
            error: null,
            status: HttpStatus_1.default.NOT_FOUND,
        };
    }
    if (ErrorInstance instanceof zod_1.z.ZodError) {
        const prettyErrors = formatZodIssues(ErrorInstance.issues);
        logger_1.default.warn("Validation Error", { errors: prettyErrors });
        return {
            message: "Validation Error",
            success: false,
            data: null,
            error: prettyErrors,
            status: HttpStatus_1.default.BAD_REQUEST,
        };
    }
    if (ErrorInstance instanceof InvalidParams_1.default) {
        logger_1.default.warn("Invalid Parameters", { message: ErrorInstance.message });
        return {
            message: ErrorInstance.message,
            success: false,
            data: null,
            error: [
                {
                    path: "General",
                    row: null,
                    field: null,
                    message: ErrorInstance.message,
                },
            ],
            status: HttpStatus_1.default.BAD_REQUEST,
        };
    }
    if (ErrorInstance instanceof ResourceConflict_1.default) {
        logger_1.default.warn("Resource Conflict", {
            message: ErrorInstance.message,
            details: ErrorInstance.details,
        });
        return {
            message: ErrorInstance.message,
            success: false,
            data: null,
            error: ErrorInstance.details ?? [
                {
                    path: "General",
                    row: null,
                    field: null,
                    message: ErrorInstance.message,
                },
            ],
            status: HttpStatus_1.default.BAD_REQUEST,
        };
    }
    // Log unexpected errors with full stack trace
    logger_1.default.error("Unexpected Error", {
        message: ErrorInstance.message,
        stack: ErrorInstance instanceof Error ? ErrorInstance.stack : undefined,
    });
    return {
        message: ErrorInstance.message,
        success: false,
        data: null,
        error: null,
        status: HttpStatus_1.default.INTERNAL_SERVER_ERROR,
    };
}
exports.default = handleErrors;
