"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const HttpStatus_1 = __importDefault(require("../shared/HttpStatus"));
const services_1 = require("../services");
const ClientValidator_1 = require("../validators/ClientValidator");
class ClientController {
    constructor() {
        this.clientService = new services_1.ClientService();
    }
    /**
     * Convert client entity to response format
     * @private
     * @param {Client | null} data - Client entity
     * @returns {ClientResponse | null} Formatted client response
     */
    toClientResponse(data) {
        return data || null;
    }
    /**
     * GET /api/clients
     * Get all clients
     */
    async getAllClients(req, res) {
        try {
            const clients = await this.clientService.getAllClients();
            const dataResponse = {
                success: true,
                error: null,
                data: clients,
                status: HttpStatus_1.default.OK,
                message: "Clients Retrieved Successfully",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
    /**
     * GET /api/clients/:id
     * Get client by ID
     */
    async getClientDetails(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = ClientValidator_1.ClientIdParamSchema.parse({ id: req.params.id });
            const client = await this.clientService.getClientById(id);
            const dataResponse = {
                success: true,
                error: null,
                data: this.toClientResponse(client),
                status: HttpStatus_1.default.OK,
                message: "Client Successfully Retrieved",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
    /**
     * POST /api/clients
     * Create a new client
     */
    async createClient(req, res) {
        try {
            // Validate request body with Zod
            const validatedData = ClientValidator_1.ClientCreateSchema.parse(req.body);
            const newClient = await this.clientService.createClient(validatedData);
            const dataResponse = {
                success: true,
                error: null,
                data: this.toClientResponse(newClient),
                status: HttpStatus_1.default.CREATED,
                message: "Client Successfully Created",
            };
            return res.status(HttpStatus_1.default.CREATED).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
    /**
     * PUT /api/clients/:id
     * Update a client
     */
    async updateClient(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = ClientValidator_1.ClientIdParamSchema.parse({ id: req.params.id });
            // Validate request body with Zod
            const validatedData = ClientValidator_1.ClientUpdateSchema.parse(req.body);
            const updatedClient = await this.clientService.updateClient(id, validatedData);
            const dataResponse = {
                success: true,
                error: null,
                data: this.toClientResponse(updatedClient),
                status: HttpStatus_1.default.OK,
                message: "Client Successfully Updated",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
    /**
     * DELETE /api/clients/:id
     * Delete a client
     */
    async deleteClient(req, res) {
        try {
            // Validate ID parameter with Zod
            const { id } = ClientValidator_1.ClientIdParamSchema.parse({ id: req.params.id });
            await this.clientService.deleteClient(id);
            const dataResponse = {
                success: true,
                error: null,
                data: null,
                status: HttpStatus_1.default.OK,
                message: "Client Successfully Deleted",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
    /**
     * GET /api/clients/search?q=query
     * Search clients by name or owner
     */
    async searchClients(req, res) {
        try {
            const query = req.query.q || "";
            if (!query || typeof query !== "string" || query.trim().length === 0) {
                const dataResponse = {
                    success: true,
                    error: null,
                    data: [],
                    status: HttpStatus_1.default.OK,
                    message: "Search query is empty",
                };
                return res.status(HttpStatus_1.default.OK).json(dataResponse);
            }
            const clients = await this.clientService.searchClients(query.trim(), 5);
            const dataResponse = {
                success: true,
                error: null,
                data: clients,
                status: HttpStatus_1.default.OK,
                message: "Clients Search Results",
            };
            return res.status(HttpStatus_1.default.OK).json(dataResponse);
        }
        catch (error) {
            const err = (0, utils_1.handleErrors)(error);
            return res.status(err.status).json(err);
        }
    }
}
exports.default = ClientController;
