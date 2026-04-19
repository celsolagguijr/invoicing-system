"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Employee_1 = require("../entities/Employee");
const Client_1 = require("../entities/Client");
const EmployeeCustomerTransaction_1 = require("../entities/EmployeeCustomerTransaction");
const Invoice_1 = require("../entities/Invoice");
const InvoiceDetail_1 = require("../entities/InvoiceDetail");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "better-sqlite3",
    database: process.env.DATABASE_URL || "./data/mydb.sqlite",
    synchronize: process.env.NODE_ENV === "development", // auto-create tables only in development
    logging: process.env.NODE_ENV === "development",
    entities: [
        User_1.User,
        Employee_1.Employee,
        Client_1.Client,
        EmployeeCustomerTransaction_1.EmployeeCustomerTransaction,
        Invoice_1.Invoice,
        InvoiceDetail_1.InvoiceDetail,
    ],
});
/**
 * Initialize database connection with retry logic
 * Attempts to connect with exponential backoff
 */
const initializeDatabase = async (maxRetries = 5) => {
    let retryCount = 0;
    const attemptConnection = async () => {
        try {
            if (!exports.AppDataSource.isInitialized) {
                await exports.AppDataSource.initialize();
                logger_1.default.info("Database connection initialized successfully");
            }
        }
        catch (error) {
            retryCount++;
            const backoffMs = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
            if (retryCount < maxRetries) {
                logger_1.default.warn(`Database connection failed. Retry ${retryCount}/${maxRetries} in ${backoffMs}ms`, {
                    error: error instanceof Error ? error.message : String(error),
                });
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                return attemptConnection();
            }
            else {
                logger_1.default.error("Database connection failed after maximum retries", {
                    error: error instanceof Error ? error.message : String(error),
                    maxRetries,
                });
                throw error;
            }
        }
    };
    return attemptConnection();
};
exports.initializeDatabase = initializeDatabase;
