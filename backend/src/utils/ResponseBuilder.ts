import HttpStatus from "../shared/HttpStatus";
import BackendResponse from "../types/Response";

class ResponseBuilder<T = unknown> {
  private response: BackendResponse<T>;

  constructor() {
    this.response = {
      success: true,
      error: null,
      data: null,
      status: HttpStatus.OK,
      message: "",
    } as BackendResponse<T>;
  }

  success(success: boolean): this {
    this.response.success = success;
    return this;
  }

  data(data: T): this {
    this.response.data = data;
    return this;
  }

  error(error: unknown): this {
    this.response.error = error as object | null;
    return this;
  }

  status(status: number): this {
    this.response.status = status;
    return this;
  }

  message(message: string): this {
    this.response.message = message;
    return this;
  }

  ok(data?: T, message: string = "Success"): BackendResponse<T> {
    return {
      success: true,
      error: null,
      data: data || null,
      status: HttpStatus.OK,
      message,
    } as BackendResponse<T>;
  }

  created(
    data?: T,
    message: string = "Resource Created Successfully",
  ): BackendResponse<T> {
    return {
      success: true,
      error: null,
      data: data || null,
      status: HttpStatus.CREATED,
      message,
    } as BackendResponse<T>;
  }

  badRequest(
    message: string = "Bad Request",
    error?: unknown,
  ): BackendResponse<null> {
    return {
      success: false,
      error: error || null,
      data: null,
      status: HttpStatus.BAD_REQUEST,
      message,
    } as BackendResponse<null>;
  }

  unauthorized(message: string = "Unauthorized"): BackendResponse<null> {
    return {
      success: false,
      error: null,
      data: null,
      status: HttpStatus.UNAUTHORIZED,
      message,
    } as BackendResponse<null>;
  }

  forbidden(message: string = "Forbidden"): BackendResponse<null> {
    return {
      success: false,
      error: null,
      data: null,
      status: HttpStatus.FORBIDDEN,
      message,
    } as BackendResponse<null>;
  }

  notFound(message: string = "Resource Not Found"): BackendResponse<null> {
    return {
      success: false,
      error: null,
      data: null,
      status: HttpStatus.NOT_FOUND,
      message,
    } as BackendResponse<null>;
  }

  conflict(
    message: string = "Resource Conflict",
    error?: unknown,
  ): BackendResponse<null> {
    return {
      success: false,
      error: error || null,
      data: null,
      status: HttpStatus.CONFLICT,
      message,
    } as BackendResponse<null>;
  }

  internalError(
    message: string = "Internal Server Error",
    error?: unknown,
  ): BackendResponse<null> {
    return {
      success: false,
      error: error || null,
      data: null,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    } as BackendResponse<null>;
  }

  build(): BackendResponse<T> {
    if (!this.response.message) {
      this.response.message = this.response.success ? "Success" : "Error";
    }
    return this.response;
  }
}

export default ResponseBuilder;
