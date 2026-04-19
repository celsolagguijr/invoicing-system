import bcrypt from "bcrypt";
import { AppDataSource } from "../config/AppSourceData";
import { User } from "../entities/User";
import {
  InvalidCredentials,
  ResourceConflict,
  ResourceNotFound,
} from "../exceptions";
import jwt from "jsonwebtoken";
import { TokenPayload, UserRequest } from "../types/User";
import dotenv from "dotenv";

dotenv.config();

class AuthService {
  private readonly SALT_ROUND = parseInt(process.env.BCRYPT_SALT_ROUND || "5");

  // JWT secret key from environment variables
  private readonly JWT_SECRET_KEY =
    process.env.JWT_SECRET_KEY || "fallback-dev-key";

  // The token expiration is set to 1 hour.
  private readonly JWT_EXPIRES_IN = parseInt(
    process.env.JWT_EXPIRES_IN || "3600",
  );

  private readonly userRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  generateToken({ id, username }: TokenPayload): string {
    const options = { expiresIn: this.JWT_EXPIRES_IN };
    return jwt.sign({ id, username }, this.JWT_SECRET_KEY, options);
  }

  isTokenValid(token: string): boolean {
    try {
      jwt.verify(token, this.JWT_SECRET_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  private async encode(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUND);
    } catch (error) {
      throw new Error("Something went wrong.");
    }
  }

  async login(username: string, password: string): Promise<User | null> {
    const userExist = await this.userRepository.findOne({
      where: { username },
    });

    if (!userExist) throw new ResourceNotFound("User not found");

    const match = await bcrypt.compare(password, userExist.password);

    if (!match) throw new InvalidCredentials("Invalid Username or Password");

    return userExist;
  }

  async register(data: UserRequest): Promise<User | null> {
    const userExist = await this.userRepository.findOne({
      where: { username: data.username },
    });

    if (userExist) throw new ResourceConflict("Email already exist");

    const user = new User();

    user.username = data.username;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.dateOfBirth = data.dateOfBirth;

    const hashPassword = await this.encode(data.password);
    user.password = hashPassword;

    return this.userRepository.save(user);
  }
}

export default AuthService;
