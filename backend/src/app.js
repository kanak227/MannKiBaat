import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import voteRoutes from "./routes/vote.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


app.use("/api/v1/mannkibaat/votes", voteRoutes);
app.use("/api/v1/mannkibaat/auth", authRoutes);
app.use("/api/v1/mannkibaat/poll", pollRoutes);

export default app;
