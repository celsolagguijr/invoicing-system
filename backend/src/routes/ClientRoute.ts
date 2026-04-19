import { Router, Request, Response } from "express";
import { ClientController } from "../controller";
import ValidateToken from "../middlewares/ValidateToken";

const router = Router();

const clientController = new ClientController();
const validateToken = new ValidateToken();

/**
 * GET /api/clients
 * @description Get all clients
 * @returns {Object[]} Array of clients with id, name, owner, address1, address2, hourly_rate
 * @example
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Acme Corp",
 *       "owner": "John Doe",
 *       "address1": "123 Main St",
 *       "address2": "Suite 100",
 *       "hourly_rate": 150.00
 *     }
 *   ],
 *   "message": "Clients Retrieved Successfully"
 * }
 */
router.get("/clients/search", async (req: Request, res: Response) => {
  await clientController.searchClients(req, res);
});

router.get("/clients", async (req: Request, res: Response) => {
  await clientController.getAllClients(req, res);
});

/**
 * GET /api/clients/:id
 * @description Get a specific client by ID
 * @param {string} req.params.id - Client ID
 * @returns {Object} Client details
 * @example
 * Request: GET /api/clients/1
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "Acme Corp",
 *     "owner": "John Doe",
 *     "address1": "123 Main St",
 *     "address2": "Suite 100",
 *     "hourly_rate": 150.00,
 *     "created_at": "2024-01-15T10:30:00.000Z",
 *     "updated_at": "2024-01-15T10:30:00.000Z"
 *   },
 *   "message": "Client Successfully Retrieved"
 * }
 */
router.get(
  "/clients/:id",
  async (req: Request<{ id?: string }>, res: Response) => {
    await clientController.getClientDetails(req, res);
  },
);

/**
 * POST /api/clients
 * @description Create a new client
 * @param {Object} req.body - Client data
 * @param {string} req.body.name - Client name (required)
 * @param {string} req.body.owner - Client owner name (required)
 * @param {string} req.body.address1 - Primary address (required)
 * @param {string} req.body.address2 - Secondary address (optional)
 * @param {number} req.body.hourly_rate - Hourly billing rate (required)
 * @returns {Object} Created client with generated ID
 * @example
 * Request body:
 * {
 *   "name": "Tech Solutions Inc",
 *   "owner": "Jane Smith",
 *   "address1": "456 Oak Ave",
 *   "address2": "Floor 2",
 *   "hourly_rate": 175.50
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 2,
 *     "name": "Tech Solutions Inc",
 *     "owner": "Jane Smith",
 *     "address1": "456 Oak Ave",
 *     "address2": "Floor 2",
 *     "hourly_rate": 175.50,
 *     "created_at": "2024-01-15T11:00:00.000Z",
 *     "updated_at": "2024-01-15T11:00:00.000Z"
 *   },
 *   "message": "Client Successfully Created"
 * }
 */
router.post("/clients", async (req: Request, res: Response) => {
  await clientController.createClient(req, res);
});

/**
 * PUT /api/clients/:id
 * @description Update an existing client
 * @param {string} req.params.id - Client ID
 * @param {Object} req.body - Client data to update (partial)
 * @param {string} req.body.name - Client name (optional)
 * @param {string} req.body.owner - Client owner name (optional)
 * @param {string} req.body.address1 - Primary address (optional)
 * @param {string} req.body.address2 - Secondary address (optional)
 * @param {number} req.body.hourly_rate - Hourly billing rate (optional)
 * @returns {Object} Updated client
 * @example
 * Request: PUT /api/clients/1
 * Body:
 * {
 *   "hourly_rate": 165.00,
 *   "address2": "Suite 200"
 * }
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "Acme Corp",
 *     "owner": "John Doe",
 *     "address1": "123 Main St",
 *     "address2": "Suite 200",
 *     "hourly_rate": 165.00,
 *     "created_at": "2024-01-15T10:30:00.000Z",
 *     "updated_at": "2024-01-15T11:15:00.000Z"
 *   },
 *   "message": "Client Successfully Updated"
 * }
 */
router.put(
  "/clients/:id",
  async (req: Request<{ id?: string }>, res: Response) => {
    await clientController.updateClient(req, res);
  },
);

/**
 * DELETE /api/clients/:id
 * @description Delete a client
 * @param {string} req.params.id - Client ID
 * @returns {Object} Success message
 * @example
 * Request: DELETE /api/clients/1
 * Response:
 * {
 *   "success": true,
 *   "data": null,
 *   "message": "Client Successfully Deleted"
 * }
 */
router.delete(
  "/clients/:id",
  async (req: Request<{ id?: string }>, res: Response) => {
    await clientController.deleteClient(req, res);
  },
);

export default router;
