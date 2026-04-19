"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../controller");
const ValidateToken_1 = __importDefault(require("../middlewares/ValidateToken"));
const router = (0, express_1.Router)();
const clientController = new controller_1.ClientController();
const validateToken = new ValidateToken_1.default();
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
router.get("/clients/search", async (req, res) => {
    await clientController.searchClients(req, res);
});
router.get("/clients", async (req, res) => {
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
router.get("/clients/:id", async (req, res) => {
    await clientController.getClientDetails(req, res);
});
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
router.post("/clients", async (req, res) => {
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
router.put("/clients/:id", async (req, res) => {
    await clientController.updateClient(req, res);
});
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
router.delete("/clients/:id", async (req, res) => {
    await clientController.deleteClient(req, res);
});
exports.default = router;
