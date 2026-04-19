export interface ConflictErrorDetail {
  path: string;
  row?: number | null;
  field?: string | null;
  client?: string | null;
  employee?: string | null;
  message: string;
}

class ResourceConflict extends Error {
  details: ConflictErrorDetail[] | null;

  constructor(message: string, details: ConflictErrorDetail[] | null = null) {
    super(message);
    this.details = details;
  }
}

export default ResourceConflict;
