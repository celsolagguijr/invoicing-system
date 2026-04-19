import { Router, Request, Response } from "express";
import { UserController } from "../controller";
import ValidateToken from "../middlewares/ValidateToken";
import { GetUserResponse } from "../types/Routes";

const router = Router();

const userController = new UserController();
const validateToken = new ValidateToken();

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
router.get(
  "/users/:id",
  [validateToken.validate],
  async (req: Request<{ id?: string }>, res: Response) => {
    await userController.getUserDetails(req, res);
  },
);

export default router;
