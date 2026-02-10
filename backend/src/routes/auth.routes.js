import express from "express";
import {
  login,
  changePassword,
  createUser
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);
router.post(
  "/create-user",
  authMiddleware,
  roleMiddleware("coordinator"),
  createUser
);

export default router;
