import { AppDataSource } from "../config/AppSourceData";
import { Client } from "../entities/Client";
import { ResourceNotFound } from "../exceptions";
import { Brackets } from "typeorm";
import {
  ClientCreateSchema,
  ClientUpdateSchema,
} from "../validators/ClientValidator";
import { z } from "zod";

class ClientService {
  private readonly clientRepository;

  constructor() {
    this.clientRepository = AppDataSource.getRepository(Client);
  }

  /**
   * Get all clients
   * @returns {Promise<Client[]>} Array of clients
   */
  async getAllClients(): Promise<Client[]> {
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
  async getClientById(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      throw new ResourceNotFound(`Client with ID ${id} not found`);
    }

    return client;
  }

  /**
   * Create a new client
   * @param {Omit<Client, 'id' | 'created_at' | 'updated_at'>} clientData - Client data
   * @returns {Promise<Client>} Created client
   * @throws {z.ZodError} If validation fails
   */
  async createClient(
    clientData: Omit<Client, "id" | "created_at" | "updated_at">,
  ): Promise<Client> {
    // Validate with Zod schema
    const validatedData = ClientCreateSchema.parse(clientData);

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
  async updateClient(
    id: number,
    clientData: Partial<Omit<Client, "id" | "created_at" | "updated_at">>,
  ): Promise<Client> {
    const client = await this.getClientById(id);

    // Validate with Zod schema
    const validatedData = ClientUpdateSchema.parse(clientData);

    Object.assign(client, validatedData);
    return await this.clientRepository.save(client);
  }

  /**
   * Delete client by ID
   * @param {number} id - Client ID
   * @returns {Promise<void>}
   * @throws {ResourceNotFound} If client does not exist
   */
  async deleteClient(id: number): Promise<void> {
    const client = await this.getClientById(id);
    await this.clientRepository.remove(client);
  }

  /**
   * Search clients by name or owner
   * @param {string} query - Search query string
   * @param {number} limit - Maximum number of results (default: 5)
   * @returns {Promise<Client[]>} Array of matching clients
   */
  async searchClients(query: string, limit: number = 5): Promise<Client[]> {
    return await this.clientRepository
      .createQueryBuilder("client")
      .where("client.status = :status", {
        status: "active",
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where("LOWER(client.name) LIKE LOWER(:query)", {
            query: `%${query}%`,
          }).orWhere("LOWER(client.owner) LIKE LOWER(:query)", {
            query: `%${query}%`,
          });
        }),
      )
      .limit(limit)
      .orderBy("client.name", "DESC")
      .getMany();
  }
}

export default ClientService;
