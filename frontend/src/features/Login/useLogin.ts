import { useMessage } from "@app/contexts/MessageContext";
import { useService } from "@contexts/ServiceContext";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosResponse, AxiosError } from "axios";
import type { ApiResponse, ApiErrorResponse } from "../../shared/types/axios";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const useLogin = () => {
  const { success, error: showError } = useMessage();
  const { auth } = useService();
  const [error, setError] = useState<string>("");

  const { mutate, status } = useMutation<
    AxiosResponse<ApiResponse<LoginResponse>>,
    AxiosError<ApiErrorResponse>,
    { username: string; password: string }
  >({
    mutationFn: async (variables: { username: string; password: string }) =>
      await auth.login(variables.username, variables.password),
    onSuccess: (res) => {
      const loginData = res?.data?.data;
      if (loginData?.token && loginData?.user) {
        auth.setToken(loginData.token);
        auth.setUserDetails(loginData.user);
        success("Authenticated!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message = error?.response?.data?.message ?? "Login failed";
      setError(message);
      showError(message);
    },
  });

  return {
    error,
    login: mutate,
    isLoading: status === "pending",
  };
};

export default useLogin;
