"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
class ResponseBuilder {
    constructor() {
        this.response = {
            success: true,
            error: null,
            data: null,
            status: HttpStatus_1.default.OK,
            message: "",
        };
    }
    success(success) {
        this.response.success = success;
        return this;
    }
    data(data) {
        this.response.data = data;
        return this;
    }
    error(error) {
        this.response.error = error;
        return this;
    }
    status(status) {
        this.response.status = status;
        return this;
    }
    message(message) {
        this.response.message = message;
        return this;
    }
    ok(data, message = "Success") {
        return {
            success: true,
            error: null,
            data: data || null,
            status: HttpStatus_1.default.OK,
            message,
        };
    }
    created(data, message = "Resource Created Successfully") {
        return {
            success: true,
            error: null,
            data: data || null,
            status: HttpStatus_1.default.CREATED,
            message,
        };
    }
    badRequest(message = "Bad Request", error) {
        return {
            success: false,
            error: error || null,
            data: null,
            status: HttpStatus_1.default.BAD_REQUEST,
            message,
        };
    }
    unauthorized(message = "Unauthorized") {
        return {
            success: false,
            error: null,
            data: null,
            status: HttpStatus_1.default.UNAUTHORIZED,
            message,
        };
    }
    forbidden(message = "Forbidden") {
        return {
            success: false,
            error: null,
            data: null,
            status: HttpStatus_1.default.FORBIDDEN,
            message,
        };
    }
    notFound(message = "Resource Not Found") {
        return {
            success: false,
            error: null,
            data: null,
            status: HttpStatus_1.default.NOT_FOUND,
            message,
        };
    }
    conflict(message = "Resource Conflict", error) {
        return {
            success: false,
            error: error || null,
            data: null,
            status: HttpStatus_1.default.CONFLICT,
            message,
        };
    }
    internalError(message = "Internal Server Error", error) {
        return {
            success: false,
            error: error || null,
            data: null,
            status: HttpStatus_1.default.INTERNAL_SERVER_ERROR,
            message,
        };
    }
    build() {
        if (!this.response.message) {
            this.response.message = this.response.success ? "Success" : "Error";
        }
        return this.response;
    }
}
exports.default = ResponseBuilder;
