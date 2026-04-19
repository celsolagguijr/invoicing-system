import User, { UserResponse } from "./User";

/**
 * Auth Login Request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Auth Register Request
 */
export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

/**
 * Auth Response (includes token)
 */
export interface AuthResponse {
  user: Omit<UserResponse, "password" | "dateOfBirth" | "age">;
  token: string;
}

/**
 * Get User Response
 */
export interface GetUserResponse {
  user: UserResponse | null;
}

/**
 * Route request/response types
 */
export const RouteTypes = {
  Login: {
    request: "LoginRequest" as const,
    response: "AuthResponse" as const,
  },
  Register: {
    request: "RegisterRequest" as const,
    response: "AuthResponse" as const,
  },
  GetUser: {
    request: "{ id: string }",
    response: "GetUserResponse" as const,
  },
};
