"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const services_1 = require("../services");
const zod_1 = require("zod");
// Note : I use zod library for request body validation for login and register
const loginSchema = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(10, "Password must be at least 10 characters long")
        .regex(/^[a-zA-Z0-9]+$/, "Password must be alphanumeric")
        .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter"),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    dateOfBirth: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Date of birth is invalid",
    })
        .transform((val) => new Date(val)),
});
class AuthController {
    constructor() {
        this.authService = new services_1.AuthService();
    }
    toUserResponse(data) {
        return {
            id: data.id,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
        };
    }
    async login(req, res) {
        try {
            const parsedBody = loginSchema.parse(req.body);
            const { username, password } = parsedBody;
            const authResult = await this.authService.login(username, password);
            const token = this.authService.generateToken({
                id: authResult?.id || 0,
                username: authResult?.username || "",
            });
            const dataResponse = {
                success: true,
                error: null,
                data: {
                    user: this.toUserResponse(authResult ?? {}),
                    token,
                },
                status: HttpStatus_1.default.OK,
                message: "Login Successfully!",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
    async register(req, res) {
        try {
            const parsedBody = registerSchema.parse(req.body);
            const { username, firstName, lastName, dateOfBirth, password } = parsedBody;
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
            const dataResponse = {
                success: true,
                error: null,
                data: {
                    user: this.toUserResponse(registerResult ?? {}),
                    token,
                },
                status: HttpStatus_1.default.OK,
                message: "Registered Successfully!",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
}
exports.default = AuthController;
