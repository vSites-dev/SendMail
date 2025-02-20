import { Router } from "express";
import prisma from "../lib/prisma";
import { TaskStatus, TaskType } from "@prisma/client";

const router = Router();

// Create a new task
router.post("/create", async (req, res) => {
  try {
    const { type, scheduledAt, projectId, campaignId, contactId } = req.body;

    // Validate required fields
    if (!type || !scheduledAt || !projectId) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["type", "scheduledAt", "projectId"],
      });
    }

    // Validate task type
    if (!Object.values(TaskType).includes(type)) {
      return res.status(400).json({
        error: "Invalid task type",
        validTypes: Object.values(TaskType),
      });
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        type,
        scheduledAt: new Date(scheduledAt),
        projectId,
        campaignId,
        contactId,
        status: TaskStatus.PENDING,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get all tasks for a project
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        status: status ? (status as TaskStatus) : undefined,
      },
      include: {
        campaign: true,
        contact: true,
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Cancel a pending task
router.post("/:taskId/cancel", async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.status !== TaskStatus.PENDING) {
      return res.status(400).json({
        error: "Only pending tasks can be cancelled",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.CANCELLED,
        processedAt: new Date(),
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Error cancelling task:", error);
    res.status(500).json({ error: "Failed to cancel task" });
  }
});

export default router;
