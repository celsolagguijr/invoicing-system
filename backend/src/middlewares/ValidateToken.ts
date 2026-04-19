import { NextFunction, Request, Response } from "express";
import HttpStatus from "../shared/HttpStatus";
import { AuthService } from "../services";
import logger from "../config/logger";

class ValidateToken {
  private readonly authService;

  constructor() {
    this.authService = new AuthService();
    this.validate = this.validate.bind(this);
  }

  validate(req: Request, res: Response, next: NextFunction): any {
    const authHeader: string | undefined = req.headers["authorization"];

    if (!authHeader) {
      logger.warn("Token validation failed: Missing token");
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        data: null,
        error: null,
        status: HttpStatus.UNAUTHORIZED,
        message: "Token is missing",
      });
    }

    //Note : Token without the prefix of `Bearer` is invalid
    // ex : Bearer <token here>
    const token: string | undefined = (authHeader || "").split(" ")[1];

    if (!token || !this.authService.isTokenValid(token)) {
      logger.warn("Token validation failed: Invalid or malformed token");
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        data: null,
        error: null,
        status: HttpStatus.FORBIDDEN,
        message: "Invalid Token",
      });
    }

    next();
  }
}

export default ValidateToken;
