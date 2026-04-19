import { Response } from "@app/shared/types";
import AuthService from "./AuthService";
import axios from "@app/shared/utils/axios";
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
} from "@app/shared/types/services/client";

export type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
} from "@app/shared/types/services/client";

class ClientService {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getClients(): Promise<Response<Client[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.get(`/clients`);
    return response.data;
  }

  async createClient(data: CreateClientRequest): Promise<Response<Client>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.post(`/clients`, data);
    return response.data;
  }

  async updateClient(
    id: number,
    data: UpdateClientRequest
  ): Promise<Response<Client>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.put(`/clients/${id}`, data);
    return response.data;
  }
}

export default ClientService;
