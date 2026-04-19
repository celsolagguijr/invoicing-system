import { Request, Response } from "express";
import BackendResponse from "../types/Response";
import { handleErrors } from "../utils";
import HttpStatus from "../shared/HttpStatus";
import { AuthService } from "../services";
import { z } from "zod";
import User, { UserRequest, UserResponse } from "../types/User";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/Routes";

// Note : I use zod library for request body validation for login and register

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const registerSchema = z.object({
  username: z.string().email(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "Password must be alphanumeric")
    .regex(
      /(?=.*[A-Z])/,
      "Password must contain at least one uppercase letter",
    ),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date of birth is invalid",
    })
    .transform((val) => new Date(val)),
});

class AuthController {
  private readonly authService;

  constructor() {
    this.authService = new AuthService();
  }

  toUserResponse(
    data: User,
  ): Omit<UserResponse, "password" | "dateOfBirth" | "age"> {
    return {
      id: data.id,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
    };
  }

  async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const parsedBody = loginSchema.parse(req.body);
      const { username, password } = parsedBody;
      const authResult = await this.authService.login(username, password);

      const token = this.authService.generateToken({
        id: authResult?.id || 0,
        username: authResult?.username || "",
      });

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: {
          user: this.toUserResponse(authResult ?? ({} as User)),
          token,
        },
        status: HttpStatus.OK,
        message: "Login Successfully!",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error | z.ZodError);
      return res.status(err.status).json(err);
    }
  }

  async register(
    req: Request<{}, {}, RegisterRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const parsedBody = registerSchema.parse(req.body);
      const { username, firstName, lastName, dateOfBirth, password } =
        parsedBody;

      const registerResult = await this.authService.register({
        username,
        firstName,
        lastName,
        dateOfBirth,
        password,
      });

      const token = this.authService.generateToken({
        id: registerResult?.id || 0,
        username: registerResult?.username || "",
      });

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: {
          user: this.toUserResponse(registerResult ?? ({} as User)),
          token,
        },
        status: HttpStatus.OK,
        message: "Registered Successfully!",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error | z.ZodError);
      return res.status(err.status).json(err);
    }
  }
}

export default AuthController;
