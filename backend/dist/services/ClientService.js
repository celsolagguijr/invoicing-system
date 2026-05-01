"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppSourceData_1 = require("../config/AppSourceData");
const Client_1 = require("../entities/Client");
const exceptions_1 = require("../exceptions");
const typeorm_1 = require("typeorm");
const ClientValidator_1 = require("../validators/ClientValidator");
class ClientService {
    constructor() {
        this.clientRepository = AppSourceData_1.AppDataSource.getRepository(Client_1.Client);
    }
    /**
     * Get all clients
     * @returns {Promise<Client[]>} Array of clients
     */
    async getAllClients() {
        return await this.clientRepository.find({
            order: { created_at: "DESC" },
        });
    }
    /**
     * Get client by ID
     * @param {number} id - Client ID
     * @returns {Promise<Client>} Client entity
     * @throws {ResourceNotFound} If client does not exist
     */
    async getClientById(id) {
        const client = await this.clientRepository.findOne({ where: { id } });
        if (!client) {
            throw new exceptions_1.ResourceNotFound(`Client with ID ${id} not found`);
        }
        return client;
    }
    /**
     * Create a new client
     * @param {Omit<Client, 'id' | 'created_at' | 'updated_at'>} clientData - Client data
     * @returns {Promise<Client>} Created client
     * @throws {z.ZodError} If validation fails
     */
    async createClient(clientData) {
        // Validate with Zod schema
        const validatedData = ClientValidator_1.ClientCreateSchema.parse(clientData);
        const newClient = this.clientRepository.create(validatedData);
        return await this.clientRepository.save(newClient);
    }
    /**
     * Update client by ID
     * @param {number} id - Client ID
     * @param {Partial<Client>} clientData - Partial client data
     * @returns {Promise<Client>} Updated client
     * @throws {ResourceNotFound} If client does not exist
     * @throws {z.ZodError} If validation fails
     */
    async updateClient(id, clientData) {
        const client = await this.getClientById(id);
        // Validate with Zod schema
        const validatedData = ClientValidator_1.ClientUpdateSchema.parse(clientData);
        Object.assign(client, validatedData);
        return await this.clientRepository.save(client);
    }
    /**
     * Delete client by ID
     * @param {number} id - Client ID
     * @returns {Promise<void>}
     * @throws {ResourceNotFound} If client does not exist
     */
    async deleteClient(id) {
        const client = await this.getClientById(id);
        await this.clientRepository.remove(client);
    }
    /**
     * Search clients by name or owner
     * @param {string} query - Search query string
     * @param {number} limit - Maximum number of results (default: 5)
     * @returns {Promise<Client[]>} Array of matching clients
     */
    async searchClients(query, limit = 5) {
        return await this.clientRepository
            .createQueryBuilder("client")
            .where("client.status = :status", {
            status: "active",
        })
            .andWhere(new typeorm_1.Brackets((qb) => {
            qb.where("LOWER(client.name) LIKE LOWER(:query)", {
                query: `%${query}%`,
            }).orWhere("LOWER(client.owner) LIKE LOWER(:query)", {
                query: `%${query}%`,
            });
        }))
            .limit(limit)
            .orderBy("client.name", "DESC")
            .getMany();
    }
}
exports.default = ClientService;
