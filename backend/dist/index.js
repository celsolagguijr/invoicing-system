"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const AppSourceData_1 = require("./config/AppSourceData");
const RequestLogger_1 = __importDefault(require("./middlewares/RequestLogger"));
const logger_1 = __importDefault(require("./config/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
let server;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
// parse json request body
app.use(express_1.default.json());
// parse urlencoded request body
app.use(express_1.default.urlencoded({ extended: true }));
// Add request logging middleware
app.use(RequestLogger_1.default);
// all routes here
app.use("/api", routes_1.default);
// Init database with retry logic
(0, AppSourceData_1.initializeDatabase)()
    .then(() => {
    logger_1.default.info("Database connection established successfully");
    // if DB init success, run the server
    server = app.listen(process.env.SERVER_PORT || 3000, () => {
        logger_1.default.info(`Server is running on port ${process.env.SERVER_PORT || 3000}`);
    });
})
    .catch((err) => {
    logger_1.default.error("Database initialization failed", { error: err.message });
    throw new Error(err);
});
// Graceful shutdown handling
const shutdown = async () => {
    logger_1.default.info("Shutdown signal received. Closing gracefully...");
    if (server) {
        server.close(async () => {
            logger_1.default.info("HTTP server closed");
            await AppSourceData_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
