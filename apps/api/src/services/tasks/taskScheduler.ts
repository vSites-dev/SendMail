import cron from "node-cron";
import prisma from "../../lib/prisma";
import { EmailService } from "../emailService";
import { Task, Campaign, Contact, TaskStatus, TaskType, EmailStatus } from "@prisma/client";

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
      console.log(`[${new Date().toISOString()}] Running scheduled task processing`);
      
      // Get current minute (with seconds and milliseconds set to 0)
      const now = new Date();
      now.setSeconds(0, 0);
      
      // Get end of the current minute
      const endOfMinute = new Date(now);
      endOfMinute.setMinutes(now.getMinutes() + 1);
      
      // Find all pending tasks that are scheduled for the current minute
      const tasks = await prisma.task.findMany({
        where: {
          status: TaskStatus.PENDING,
          scheduledAt: {
            gte: now,
            lt: endOfMinute
          },
        },
        include: {
          campaign: {
            include: {
              contacts: true
            }
          }
        },
      });

      console.log(`Found ${tasks.length} tasks due in the current minute`);
      
      let processed = 0;
      let failed = 0;

      for (const task of tasks) {
        try {
          // Mark task as processing
          await prisma.task.update({
            where: { id: task.id },
            data: { status: TaskStatus.PROCESSING }
          });
          
          await this.processTask(task);
          processed++;
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error);
          failed++;

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
      
      console.log(`Task processing completed: ${processed} processed, ${failed} failed`);
    } catch (error) {
      console.error("Error in task scheduler:", error);
    }
  }

  private async processTask(
    task: Task & {
      campaign?: Campaign & {
        contacts: Contact[];
      } | null;
    }
  ) {
    switch (task.type) {
      case TaskType.SEND_EMAIL:
        throw new Error("Not implemented");

      case TaskType.SEND_CAMPAIGN:
        if (!task.campaignId) {
          throw new Error("Campaign ID not found for SEND_CAMPAIGN task");
        }
        
        if (!task.campaign) {
          throw new Error(`Campaign not found for task ${task.id}`);
        }
        
        // Process each contact in the campaign
        for (const contact of task.campaign.contacts) {
          // Find or create an email for each contact
          const campaignEmail = await prisma.email.findFirst({
            where: {
              contactId: contact.id,
              campaignId: task.campaign.id,
              status: EmailStatus.QUEUED
            }
          });
          
          if (campaignEmail) {
            // Send the email
            const result = await this.emailService.sendEmail({
              from: task.campaign.from || process.env.DEFAULT_FROM!,
              to: contact.email,
              subject: campaignEmail.subject,
              body: campaignEmail.body,
            });
            
            // Update email status
            await prisma.email.update({
              where: { id: campaignEmail.id },
              data: {
                messageId: result.messageId || campaignEmail.messageId,
                status: EmailStatus.SENT,
                sentAt: new Date(),
              },
            });
          }
        }
        break;

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
