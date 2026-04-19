import { User } from "../entities/User";

export type TokenPayload = Pick<InstanceType<typeof User>, "id" | "username">;

export type UserRequest = Omit<InstanceType<typeof User>, "id">;
export type UserResponse = InstanceType<typeof User> & { age: number };

export default User;
