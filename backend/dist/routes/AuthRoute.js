"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../controller");
const router = (0, express_1.Router)();
const authController = new controller_1.AuthController();
router.post("/auth", async (req, res) => {
    await authController.login(req, res);
});
router.post("/register", async (req, res) => {
    await authController.register(req, res);
});
exports.default = router;
