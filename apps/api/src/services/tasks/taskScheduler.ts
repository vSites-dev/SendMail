import cron from "node-cron";
import prisma from "../../lib/prisma";
import { EmailService } from "../emailService";
import { Task, Campaign, Contact, TaskStatus, TaskType } from "@prisma/client";

export class TaskScheduler {
  private emailService: EmailService;
  private cronJob: cron.ScheduledTask;

  constructor() {
    this.emailService = new EmailService();
    // Check for new tasks every minute
    this.cronJob = cron.schedule(
      "* * * * *",
      this.processScheduledTasks.bind(this)
    );
  }

  async processScheduledTasks() {
    try {
      // Find all pending tasks that are scheduled for now or in the past
      const tasks = await prisma.task.findMany({
        where: {
          status: TaskStatus.PENDING,
          scheduledAt: {
            lte: new Date(),
          },
        },
        include: {
          campaign: true,
          contact: true,
        },
      });

      for (const task of tasks) {
        try {
          await this.processTask(task);
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error);

          // Update task status to FAILED
          await prisma.task.update({
            where: { id: task.id },
            data: {
              status: TaskStatus.FAILED,
              error: error instanceof Error ? error.message : "Unknown error",
              processedAt: new Date(),
            },
          });
        }
      }
    } catch (error) {
      console.error("Error in task scheduler:", error);
    }
  }

  private async processTask(
    task: Task & {
      campaign?: Campaign | null;
      contact?: Contact | null;
    }
  ) {
    switch (task.type) {
      case TaskType.SEND_EMAIL:
        if (!task.contact?.email) {
          throw new Error("Contact email not found");
        }

        // Create and send the email
        const email = await prisma.email.create({
          data: {
            messageId: `pending_${task.id}`, // Temporary messageId until actual send
            subject: task.campaign?.subject || "No subject",
            body: task.campaign?.body || "No content",
            status: "QUEUED",
            contact: {
              connect: { id: task.contactId! },
            },
            ...(task.campaignId && {
              campaign: {
                connect: { id: task.campaignId },
              },
            }),
          },
        });

        const result = await this.emailService.sendEmail({
          from: process.env.DEFAULT_FROM_EMAIL || "noreply@yourdomain.com",
          to: task.contact.email,
          subject: email.subject,
          body: email.body,
        });

        // Update email status
        await prisma.email.update({
          where: { id: email.id },
          data: {
            messageId: result.messageId,
            status: "SENT",
            sentAt: new Date(),
          },
        });

        break;

      // Add other task types here
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }

    // Mark task as completed
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: TaskStatus.COMPLETED,
        processedAt: new Date(),
      },
    });
  }

  start() {
    this.cronJob.start();
    console.log("Task scheduler started");
  }

  stop() {
    this.cronJob.stop();
    console.log("Task scheduler stopped");
  }
}
