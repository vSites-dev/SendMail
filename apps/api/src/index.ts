import 'dotenv/config';
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";
import emailRoutes from "./routes/emailRoutes";
import taskRoutes from "./routes/taskRoutes";
import domainRoutes from "./routes/domainRoutes";
import { TaskScheduler } from "./services/tasks/taskScheduler";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use('/email', emailRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/domains", domainRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize task scheduler
const taskScheduler = new TaskScheduler();
taskScheduler.start();

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
