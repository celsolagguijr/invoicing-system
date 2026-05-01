"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../controller");
const ValidateToken_1 = __importDefault(require("../middlewares/ValidateToken"));
const router = (0, express_1.Router)();
const userController = new controller_1.UserController();
const validateToken = new ValidateToken_1.default();
/**
 * GET /api/users/:id
 * @description Get user details by ID (requires authentication)
 * @param {string} req.params.id - User ID
 * @param {string} req.headers.authorization - Bearer token
 * @returns {GetUserResponse} User details including age
 * @requires Authorization: Bearer <token>
 * @example
 * Request headers:
 * {
 *   "Authorization": "Bearer jwt_token_here"
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "username": "user@example.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "dateOfBirth": "1990-01-01",
 *       "age": 34
 *     }
 *   },
 *   "message": "User Successfully Retrieved"
 * }
 */
router.get("/users/:id", [validateToken.validate], async (req, res) => {
    await userController.getUserDetails(req, res);
});
exports.default = router;
