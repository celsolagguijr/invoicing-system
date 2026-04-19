import { Router, Request, Response } from "express";
import { AuthController } from "../controller";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/Routes";

const router = Router();

const authController = new AuthController();

router.post(
  "/auth",
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    await authController.login(req, res);
  },
);

router.post(
  "/register",
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    await authController.register(req, res);
  },
);

export default router;
