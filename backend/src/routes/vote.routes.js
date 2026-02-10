import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { castVote } from "../controllers/vote.controller.js";

const router = express.Router();

router.post(
  "/:pollId",
  authMiddleware,
  roleMiddleware("student"),
  castVote
);



export default router;
