import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { AppDataSource, initializeDatabase } from "./config/AppSourceData";
import RequestLogger from "./middlewares/RequestLogger";
import logger from "./config/logger";
import dotenv from "dotenv";

dotenv.config();

const app = express();
let server: any;

app.use(cors({ origin: true }));
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use(RequestLogger);

// all routes here
app.use("/api", routes);

// Init database with retry logic
initializeDatabase()
  .then(() => {
    logger.info("Database connection established successfully");

    // if DB init success, run the server
    const PORT = Number(process.env.SERVER_PORT) || 3000;
    const HOST = process.env.SERVER_HOST || "0.0.0.0";

    server = app.listen(PORT, HOST, () => {
      logger.info(`Server is running on http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Database initialization failed", { error: err.message });
    throw new Error(err);
  });

// Graceful shutdown handling
const shutdown = async () => {
  logger.info("Shutdown signal received. Closing gracefully...");

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");
      await AppDataSource.destroy();
      logger.info("Database connection closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
