import { Client } from "../entities/Client";
import {
  ClientCreateSchema,
  ClientUpdateSchema,
  ClientIdParamSchema,
} from "../validators/ClientValidator";
import { z } from "zod";

// Manual types (legacy, kept for compatibility)
export type ClientRequest = Omit<
  InstanceType<typeof Client>,
  "id" | "created_at" | "updated_at"
>;
export type ClientResponse = InstanceType<typeof Client>;
export type ClientUpdateRequest = Partial<ClientRequest>;

// Zod-inferred types (recommended)
export type ClientCreateInput = z.infer<typeof ClientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof ClientUpdateSchema>;
export type ClientIdInput = z.infer<typeof ClientIdParamSchema>;

export default Client;
