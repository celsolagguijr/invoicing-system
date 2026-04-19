import { Request, Response } from "express";
import BackendResponse from "../types/Response";
import { handleErrors } from "../utils";
import HttpStatus from "../shared/HttpStatus";
import User, { UserResponse } from "../types/User";
import { UserService } from "../services";
import { calculateAge } from "../utils";
import { InvalidParams } from "../exceptions";
import { GetUserResponse } from "../types/Routes";

class UserController {
  private readonly userService;

  constructor() {
    this.userService = new UserService();
  }

  toUserResponse(data: User | null): UserResponse | null {
    if (!data) return null;

    return {
      id: data.id,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      age: calculateAge(new Date(data.dateOfBirth)),
      password: data.password,
    };
  }

  async getUserDetails(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) throw new InvalidParams("User Id is required");

      if (isNaN(parseInt(id)) || typeof parseInt(id) !== "number")
        throw new InvalidParams("User Id is invalid");

      const user = await this.userService.getUserById(parseInt(id));

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: this.toUserResponse(user),
        status: HttpStatus.OK,
        message: "User Successfully Retrieved",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }
}

export default UserController;
