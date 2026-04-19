"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const services_1 = require("../services");
const logger_1 = __importDefault(require("../config/logger"));
class ValidateToken {
    constructor() {
        this.authService = new services_1.AuthService();
        this.validate = this.validate.bind(this);
    }
    validate(req, res, next) {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            logger_1.default.warn("Token validation failed: Missing token");
            return res.status(HttpStatus_1.default.UNAUTHORIZED).json({
                success: false,
                data: null,
                error: null,
                status: HttpStatus_1.default.UNAUTHORIZED,
                message: "Token is missing",
            });
        }
        //Note : Token without the prefix of `Bearer` is invalid
        // ex : Bearer <token here>
        const token = (authHeader || "").split(" ")[1];
        if (!token || !this.authService.isTokenValid(token)) {
            logger_1.default.warn("Token validation failed: Invalid or malformed token");
            return res.status(HttpStatus_1.default.FORBIDDEN).json({
                success: false,
                data: null,
                error: null,
                status: HttpStatus_1.default.FORBIDDEN,
                message: "Invalid Token",
            });
        }
        next();
    }
}
exports.default = ValidateToken;
