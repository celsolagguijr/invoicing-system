import { useMessage } from "@app/contexts/MessageContext";
import { useService } from "@contexts/ServiceContext";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { ApiResponse } from "../../shared/types/axios";
import { Client } from "@app/services/ClientService";

const useClients = () => {
  const { error: errorMsg } = useMessage();
  const { client } = useService();

  const { data, isLoading, error, refetch } = useQuery<
    ApiResponse<Client[]>,
    AxiosError
  >({
    queryKey: ["clients"],
    queryFn: async () => {
      return await client.getClients();
    },
    retry: 1,
  });

  if (error) {
    errorMsg(error.message || "Failed to fetch clients");
  }

  return {
    error,
    clients: data?.data || [],
    refetch,
    isLoading,
  };
};

export default useClients;
