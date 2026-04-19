"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppSourceData_1 = require("../config/AppSourceData");
const User_1 = require("../entities/User");
class UserService {
    constructor() {
        this.userService = AppSourceData_1.AppDataSource.getRepository(User_1.User);
    }
    async getUserByUsername(username) {
        return (await this.userService.findOne({ where: { username } })) || null;
    }
    async getUserById(id) {
        return await this.userService.findOne({ where: { id } });
    }
}
exports.default = UserService;
