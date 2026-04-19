import { AppDataSource } from "../config/AppSourceData";
import { User } from "../entities/User";

class UserService {
  private readonly userService;

  constructor() {
    this.userService = AppDataSource.getRepository(User);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return (await this.userService.findOne({ where: { username } })) || null;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userService.findOne({ where: { id } });
  }
}

export default UserService;
