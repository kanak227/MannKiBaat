import express from "express";
import roleMiddleware from "../middlewares/role.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createPoll , getAllPoll , getPollResults ,closePoll,
  toggleResults,
  getSinglePoll}  from "../controllers/poll.controller.js";

const router = express.Router();

router.post(
	"/create",
	authMiddleware,
	roleMiddleware("coordinator"),
	createPoll
);

router.get("/getAllPolls" , authMiddleware , getAllPoll);


router.get(
  "/:pollId/results",
  authMiddleware,
  getPollResults
);


// Close poll
router.post(
  "/:pollId/close",
  authMiddleware,
  roleMiddleware("coordinator"),
  closePoll
);

// Toggle results visibility
router.post(
  "/:pollId/toggle-results",
  authMiddleware,
  roleMiddleware("coordinator"),
  toggleResults
);
router.get("/:pollId", authMiddleware, getSinglePoll);
export default router;