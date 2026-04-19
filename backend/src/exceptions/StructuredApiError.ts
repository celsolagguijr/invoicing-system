import ResourceConflict, { ConflictErrorDetail } from "./ResourceConflict";

export interface StructuredApiErrorDetail extends ConflictErrorDetail {
  path: string;
  client: string | null;
  employee: string | null;
  message: string;
}

class StructuredApiError extends ResourceConflict {
  constructor(message: string, details: StructuredApiErrorDetail[]) {
    super(message, details);
  }
}

export default StructuredApiError;
