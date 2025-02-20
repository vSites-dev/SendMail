import express from "express";
import cors from "cors";
import prisma from "./lib/prisma";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Test endpoint to verify Prisma connection
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
