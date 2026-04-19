import { useMessage } from "@app/contexts/MessageContext";
import { UserRegistration } from "@app/shared/types/models/User";
import { useService } from "@contexts/ServiceContext";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AxiosResponse, AxiosError } from "axios";
import type { ApiResponse, ApiErrorResponse } from "../../shared/types/axios";

interface RegisterResponse {
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface FieldError {
  _errors?: string[];
}

type FieldErrors = {
  [key: string]: FieldError;
} | null;

const useRegister = () => {
  const { auth } = useService();
  const { success, error: showError } = useMessage();
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(null);

  const { mutate, status } = useMutation<
    AxiosResponse<ApiResponse<RegisterResponse>>,
    AxiosError<ApiErrorResponse>,
    UserRegistration
  >({
    mutationFn: async (data: UserRegistration) => await auth.register(data),
    onSuccess: (res) => {
      const registerData = res?.data?.data;
      if (registerData?.token && registerData?.user) {
        auth.setToken(registerData.token);
        auth.setUserDetails(registerData.user);
        success("Successfully Created!");
        setTimeout(() => {
          window.location.href = "/user-profile";
        }, 1000);
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message = error?.response?.data?.message ?? "Registration failed";
      setError(message);
      showError(message);
      setFieldErrors((error?.response?.data?.error as FieldErrors) ?? null);
    },
  });

  return {
    error,
    fieldErrors,
    register: mutate,
    isLoading: status === "pending",
  };
};

export default useRegister;
