import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Employee } from "../entities/Employee";
import { Client } from "../entities/Client";
import { EmployeeCustomerTransaction } from "../entities/EmployeeCustomerTransaction";
import { Invoice } from "../entities/Invoice";
import { InvoiceDetail } from "../entities/InvoiceDetail";
import dotenv from "dotenv";
import logger from "./logger";
import { InvoiceAdjustment } from "../entities/InvoiceAdjustment";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DATABASE_URL || "./data/mydb.sqlite",
  synchronize: process.env.NODE_ENV === "development", // auto-create tables only in development
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    Employee,
    Client,
    EmployeeCustomerTransaction,
    Invoice,
    InvoiceDetail,
    InvoiceAdjustment,
  ],
});

/**
 * Initialize database connection with retry logic
 * Attempts to connect with exponential backoff
 */
export const initializeDatabase = async (
  maxRetries: number = 5,
): Promise<void> => {
  let retryCount = 0;

  const attemptConnection = async (): Promise<void> => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        logger.info("Database connection initialized successfully");
      }
    } catch (error) {
      retryCount++;
      const backoffMs = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);

      if (retryCount < maxRetries) {
        logger.warn(
          `Database connection failed. Retry ${retryCount}/${maxRetries} in ${backoffMs}ms`,
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return attemptConnection();
      } else {
        logger.error("Database connection failed after maximum retries", {
          error: error instanceof Error ? error.message : String(error),
          maxRetries,
        });
        throw error;
      }
    }
  };

  return attemptConnection();
};
