import { Response } from "@app/shared/types";
import AuthService from "./AuthService";
import axios from "@app/shared/utils/axios";
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@app/shared/types/services/employee";

export type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@app/shared/types/services/employee";

class EmployeeService {
  private authService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getEmployees(): Promise<Response<Employee[]>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.get(`/employees`);
    return response.data;
  }

  async createEmployee(
    data: CreateEmployeeRequest
  ): Promise<Response<Employee>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.post(`/employees`, data);
    return response.data;
  }

  async updateEmployee(
    id: number,
    data: UpdateEmployeeRequest
  ): Promise<Response<Employee>> {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${this.authService.getToken()}`;
    const response = await axios.put(`/employees/${id}`, data);
    return response.data;
  }
}

export default EmployeeService;
