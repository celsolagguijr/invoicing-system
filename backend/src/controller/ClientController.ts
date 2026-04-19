import { Request, Response } from "express";
import BackendResponse from "../types/Response";
import { handleErrors } from "../utils";
import HttpStatus from "../shared/HttpStatus";
import {
  ClientResponse,
  ClientRequest,
  ClientUpdateRequest,
} from "../types/Client";
import { ClientService } from "../services";
import {
  ClientCreateSchema,
  ClientUpdateSchema,
  ClientIdParamSchema,
} from "../validators/ClientValidator";

class ClientController {
  private readonly clientService;

  constructor() {
    this.clientService = new ClientService();
  }

  /**
   * Convert client entity to response format
   * @private
   * @param {Client | null} data - Client entity
   * @returns {ClientResponse | null} Formatted client response
   */
  private toClientResponse(data: ClientResponse | null): ClientResponse | null {
    return data || null;
  }

  /**
   * GET /api/clients
   * Get all clients
   */
  async getAllClients(
    req: Request,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const clients = await this.clientService.getAllClients();

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: clients,
        status: HttpStatus.OK,
        message: "Clients Retrieved Successfully",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }

  /**
   * GET /api/clients/:id
   * Get client by ID
   */
  async getClientDetails(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = ClientIdParamSchema.parse({ id: req.params.id });

      const client = await this.clientService.getClientById(id);

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: this.toClientResponse(client),
        status: HttpStatus.OK,
        message: "Client Successfully Retrieved",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }

  /**
   * POST /api/clients
   * Create a new client
   */
  async createClient(
    req: Request<{}, {}, ClientRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate request body with Zod
      const validatedData = ClientCreateSchema.parse(req.body);

      const newClient = await this.clientService.createClient(validatedData);

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: this.toClientResponse(newClient),
        status: HttpStatus.CREATED,
        message: "Client Successfully Created",
      };

      return res.status(HttpStatus.CREATED).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }

  /**
   * PUT /api/clients/:id
   * Update a client
   */
  async updateClient(
    req: Request<{ id?: string }, {}, ClientUpdateRequest>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = ClientIdParamSchema.parse({ id: req.params.id });

      // Validate request body with Zod
      const validatedData = ClientUpdateSchema.parse(req.body);

      const updatedClient = await this.clientService.updateClient(
        id,
        validatedData,
      );

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: this.toClientResponse(updatedClient),
        status: HttpStatus.OK,
        message: "Client Successfully Updated",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }

  /**
   * DELETE /api/clients/:id
   * Delete a client
   */
  async deleteClient(
    req: Request<{ id?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      // Validate ID parameter with Zod
      const { id } = ClientIdParamSchema.parse({ id: req.params.id });

      await this.clientService.deleteClient(id);

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: null,
        status: HttpStatus.OK,
        message: "Client Successfully Deleted",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }

  /**
   * GET /api/clients/search?q=query
   * Search clients by name or owner
   */
  async searchClients(
    req: Request<{}, {}, {}, { q?: string }>,
    res: Response<BackendResponse>,
  ): Promise<Response> {
    try {
      const query = req.query.q || "";

      if (!query || typeof query !== "string" || query.trim().length === 0) {
        const dataResponse: BackendResponse = {
          success: true,
          error: null,
          data: [],
          status: HttpStatus.OK,
          message: "Search query is empty",
        };
        return res.status(HttpStatus.OK).json(dataResponse);
      }

      const clients = await this.clientService.searchClients(query.trim(), 5);

      const dataResponse: BackendResponse = {
        success: true,
        error: null,
        data: clients,
        status: HttpStatus.OK,
        message: "Clients Search Results",
      };

      return res.status(HttpStatus.OK).json(dataResponse);
    } catch (error) {
      const err = handleErrors(error as Error);
      return res.status(err.status).json(err);
    }
  }
}

export default ClientController;
