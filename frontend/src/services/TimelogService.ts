import { Response } from "@app/shared/types";
import AuthService from "./AuthService";
import axios from "@app/shared/utils/axios";
import type {
  Employee,
  Client,
  CreateTimelogRequest,
  CreateTimelogResponse,
  EmployeeTimelogReportQuery,
  EmployeeTimelogReportItem,
  UpdateWorkingHoursRequest,
} from "@app/shared/types/services/timelog";

export type {
  Employee,
  Client,
  TimelogTransaction,
  CreateTimelogRequest,
  CreateTimelogResponse,
  EmployeeTimelogReportQuery,
  EmployeeTimelogReportItem,
  UpdateWorkingHoursRequest,
} from "@app/shared/types/services/timelog";

class TimelogService {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async searchEmployees(query: string): Promise<Response<Employee[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.get(`/employees/search`, {
      params: { q: query },
    });
    return response.data;
  }

  async searchClients(query: string): Promise<Response<Client[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.get(`/clients/search`, {
      params: { q: query },
    });
    return response.data;
  }

  async createTimelogs(
    data: CreateTimelogRequest
  ): Promise<Response<CreateTimelogResponse[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.post(`/transactions/batch`, data);
    return response.data;
  }

  async getEmployeeTimelogReport(
    query: EmployeeTimelogReportQuery
  ): Promise<Response<EmployeeTimelogReportItem[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;

    const response = await axios.get(`/transactions/date-range`, {
      params: query,
    });

    return response.data;
  }

  async updateWorkingHours(
    id: number,
    data: UpdateWorkingHoursRequest
  ): Promise<Response<EmployeeTimelogReportItem>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.put(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: number): Promise<Response<null>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.delete(`/transactions/${id}`);
    return response.data;
  }
}

export default TimelogService;
