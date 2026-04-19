import { z } from "zod";
import NotFound from "../exceptions/ResourceNotFound";
import UserInvalidCredentials from "../exceptions/InvalidCredentials";
import HttpStatus from "../shared/HttpStatus";
import Response from "../types/Response";
import { ApiErrorItem } from "../types/ApiError";
import InvalidParams from "../exceptions/InvalidParams";
import ResourceConflict from "../exceptions/ResourceConflict";
import logger from "../config/logger";

const prettifyPathSegment = (segment: string | number): string => {
  if (typeof segment === "number") {
    return `row ${segment + 1}`;
  }

  return segment
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatZodIssues = (issues: z.ZodIssue[]): ApiErrorItem[] => {
  return issues.map((issue) => {
    const rowSegment = issue.path.find(
      (segment) => typeof segment === "number",
    );
    const fieldSegment = [...issue.path]
      .reverse()
      .find((segment) => typeof segment === "string");
    const prettyPath = issue.path.length
      ? issue.path.map(prettifyPathSegment).join(" > ")
      : "General";

    return {
      path: prettyPath,
      row: typeof rowSegment === "number" ? rowSegment + 1 : null,
      field: typeof fieldSegment === "string" ? fieldSegment : null,
      message: issue.message,
    };
  });
};

function handleErrors(ErrorInstance: Error | z.ZodError): Response {
  if (ErrorInstance instanceof UserInvalidCredentials) {
    logger.warn("Authentication Error", { message: ErrorInstance.message });
    return {
      message: ErrorInstance.message,
      success: false,
      data: null,
      error: null,
      status: HttpStatus.BAD_REQUEST,
    };
  }

  if (ErrorInstance instanceof NotFound) {
    logger.warn("Resource Not Found", { message: ErrorInstance.message });
    return {
      message: ErrorInstance.message,
      success: false,
      data: null,
      error: null,
      status: HttpStatus.NOT_FOUND,
    };
  }

  if (ErrorInstance instanceof z.ZodError) {
    const prettyErrors = formatZodIssues(ErrorInstance.issues);
    logger.warn("Validation Error", { errors: prettyErrors });
    return {
      message: "Validation Error",
      success: false,
      data: null,
      error: prettyErrors,
      status: HttpStatus.BAD_REQUEST,
    };
  }

  if (ErrorInstance instanceof InvalidParams) {
    logger.warn("Invalid Parameters", { message: ErrorInstance.message });
    return {
      message: ErrorInstance.message,
      success: false,
      data: null,
      error: [
        {
          path: "General",
          row: null,
          field: null,
          message: ErrorInstance.message,
        },
      ],
      status: HttpStatus.BAD_REQUEST,
    };
  }

  if (ErrorInstance instanceof ResourceConflict) {
    logger.warn("Resource Conflict", {
      message: ErrorInstance.message,
      details: ErrorInstance.details,
    });
    return {
      message: ErrorInstance.message,
      success: false,
      data: null,
      error: ErrorInstance.details ?? [
        {
          path: "General",
          row: null,
          field: null,
          message: ErrorInstance.message,
        },
      ],
      status: HttpStatus.BAD_REQUEST,
    };
  }

  // Log unexpected errors with full stack trace
  logger.error("Unexpected Error", {
    message: ErrorInstance.message,
    stack: ErrorInstance instanceof Error ? ErrorInstance.stack : undefined,
  });

  return {
    message: ErrorInstance.message,
    success: false,
    data: null,
    error: null,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  };
}

export default handleErrors;
