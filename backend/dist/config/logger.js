"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const logLevel = process.env.LOG_LEVEL || "info";
const nodeEnv = process.env.NODE_ENV || "development";
// Define custom log format
const customFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
    const stackString = stack ? `\n${stack}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}${stackString}`;
}));
// Define transports based on environment
const transports = [
    // Always log to console
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), customFormat),
    }),
];
// In production, also log to files
if (nodeEnv === "production") {
    transports.push(new winston_1.default.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: customFormat,
    }), new winston_1.default.transports.File({
        filename: "logs/combined.log",
        format: customFormat,
    }));
}
const logger = winston_1.default.createLogger({
    level: logLevel,
    format: customFormat,
    transports,
    exceptionHandlers: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), customFormat),
        }),
    ],
});
// Handle rejections
if (nodeEnv !== "test") {
    process.on("unhandledRejection", (reason) => {
        logger.error("Unhandled Rejection:", { reason });
    });
}
exports.default = logger;
