"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Middleware to log HTTP requests
 * Logs: method, path, status code, response time
 */
const RequestLogger = (req, res, next) => {
    const startTime = Date.now();
    const { method, path, ip } = req;
    // Log request
    logger_1.default.info(`Incoming Request`, {
        method,
        path,
        ip,
        userAgent: req.get("user-agent"),
    });
    // Override res.json to capture response data
    const originalJson = res.json.bind(res);
    let responseBody = null;
    res.json = (body) => {
        responseBody = body;
        return originalJson(body);
    };
    // Listen for finish event to log response
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const { statusCode } = res;
        logger_1.default.info(`Outgoing Response`, {
            method,
            path,
            statusCode,
            duration: `${duration}ms`,
            ip,
        });
    });
    next();
};
exports.default = RequestLogger;
