export interface Client {
  id: number;
  name: string;
  owner: string;
  address1: string;
  address2: string;
  hourly_rate: number;
  ot_hourly_rate: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  name: string;
  owner: string;
  address1: string;
  address2: string;
  hourly_rate: number;
  ot_hourly_rate: number;
  status: "active" | "inactive";
}

export interface UpdateClientRequest {
  name?: string;
  owner?: string;
  address1?: string;
  address2?: string;
  hourly_rate?: number;
  ot_hourly_rate?: number;
  status?: "active" | "inactive";
}
