import { UserDetails, UserRegistration } from "@app/shared/types/models/User";
import axios from "@app/shared/utils/axios";

class AuthService {
  private readonly tokenKey = "access_token";
  private readonly userKey = "user_details";

  async login(username: string, password: string) {
    return await axios.post("/auth", { username, password });
  }

  async register(data: UserRegistration) {
    return await axios.post("/register", data);
  }

  setUserDetails(details: UserDetails | null) {
    localStorage.setItem(this.userKey, JSON.stringify(details));
  }

  getUserDetails(): UserDetails | null {
    const storedUserDetails = localStorage.getItem(this.userKey);
    if (storedUserDetails === null) {
      return null;
    }
    try {
      return JSON.parse(storedUserDetails);
    } catch (error) {
      return null;
    }
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    this.setToken("");
    this.setUserDetails(null);
  }
}

export default AuthService;
