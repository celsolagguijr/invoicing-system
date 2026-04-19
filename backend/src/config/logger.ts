import winston from "winston";

const logLevel = process.env.LOG_LEVEL || "info";
const nodeEnv = process.env.NODE_ENV || "development";

// Define custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : "";
    const stackString = stack ? `\n${stack}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}${stackString}`;
  }),
);

// Define transports based on environment
const transports: winston.transport[] = [
  // Always log to console
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), customFormat),
  }),
];

// In production, also log to files
if (nodeEnv === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: customFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: customFormat,
    }),
  );
}

const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customFormat),
    }),
  ],
});

// Handle rejections
if (nodeEnv !== "test") {
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection:", { reason });
  });
}

export default logger;
