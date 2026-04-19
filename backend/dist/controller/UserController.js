"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const services_1 = require("../services");
const utils_2 = require("../utils");
const exceptions_1 = require("../exceptions");
class UserController {
    constructor() {
        this.userService = new services_1.UserService();
    }
    toUserResponse(data) {
        if (!data)
            return null;
        return {
            id: data.id,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            age: (0, utils_2.calculateAge)(new Date(data.dateOfBirth)),
            password: data.password,
        };
    }
    async getUserDetails(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                throw new exceptions_1.InvalidParams("User Id is required");
            if (isNaN(parseInt(id)) || typeof parseInt(id) !== "number")
                throw new exceptions_1.InvalidParams("User Id is invalid");
            const user = await this.userService.getUserById(parseInt(id));
            const dataResponse = {
                success: true,
                error: null,
                data: this.toUserResponse(user),
                status: HttpStatus_1.default.OK,
                message: "User Successfully Retrieved",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
}
exports.default = UserController;
