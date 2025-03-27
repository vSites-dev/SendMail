import { Router } from "express";
import { taskScheduler } from "../index";

const router = Router();

// Endpoint to manually trigger processing of due tasks
router.post("/process-due", async (req, res) => {
  try {
    await taskScheduler.processScheduledTasks();
    res.json({
      message: "Task processing completed successfully"
    });
  } catch (error: any) {
    console.error("Error processing due tasks:", error);
    res.status(500).json({ error: "Failed to process due tasks", message: error.message });
  }
});

export default router;
