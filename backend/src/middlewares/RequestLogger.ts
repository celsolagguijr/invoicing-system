import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

/**
 * Middleware to log HTTP requests
 * Logs: method, path, status code, response time
 */
const RequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // Log request
  logger.info(`Incoming Request`, {
    method,
    path,
    ip,
    userAgent: req.get("user-agent"),
  });

  // Override res.json to capture response data
  const originalJson = res.json.bind(res);
  let responseBody: any = null;

  res.json = (body: any) => {
    responseBody = body;
    return originalJson(body);
  };

  // Listen for finish event to log response
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    logger.info(`Outgoing Response`, {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      ip,
    });
  });

  next();
};

export default RequestLogger;
