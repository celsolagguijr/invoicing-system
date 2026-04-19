"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppSourceData_1 = require("../config/AppSourceData");
const User_1 = require("../entities/User");
const exceptions_1 = require("../exceptions");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthService {
    constructor() {
        this.SALT_ROUND = parseInt(process.env.BCRYPT_SALT_ROUND || "5");
        // JWT secret key from environment variables
        this.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "fallback-dev-key";
        // The token expiration is set to 1 hour.
        this.JWT_EXPIRES_IN = parseInt(process.env.JWT_EXPIRES_IN || "3600");
        this.userRepository = AppSourceData_1.AppDataSource.getRepository(User_1.User);
    }
    generateToken({ id, username }) {
        const options = { expiresIn: this.JWT_EXPIRES_IN };
        return jsonwebtoken_1.default.sign({ id, username }, this.JWT_SECRET_KEY, options);
    }
    isTokenValid(token) {
        try {
            jsonwebtoken_1.default.verify(token, this.JWT_SECRET_KEY);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async encode(password) {
        try {
            return await bcrypt_1.default.hash(password, this.SALT_ROUND);
        }
        catch (error) {
            throw new Error("Something went wrong.");
        }
    }
    async login(username, password) {
        const userExist = await this.userRepository.findOne({
            where: { username },
        });
        if (!userExist)
            throw new exceptions_1.ResourceNotFound("User not found");
        const match = await bcrypt_1.default.compare(password, userExist.password);
        if (!match)
            throw new exceptions_1.InvalidCredentials("Invalid Username or Password");
        return userExist;
    }
    async register(data) {
        const userExist = await this.userRepository.findOne({
            where: { username: data.username },
        });
        if (userExist)
            throw new exceptions_1.ResourceConflict("Email already exist");
        const user = new User_1.User();
        user.username = data.username;
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.dateOfBirth = data.dateOfBirth;
        const hashPassword = await this.encode(data.password);
        user.password = hashPassword;
        return this.userRepository.save(user);
    }
}
exports.default = AuthService;
