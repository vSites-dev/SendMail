import cron from 'node-cron'
import prisma from '../../lib/prisma'
import { EmailService } from '../emailService'
import {
  Task,
  Campaign,
  Contact,
  TaskStatus,
  TaskType,
  EmailStatus,
  Email,
  ContactStatus
} from '@prisma/client'
import 'dotenv/config'

export class TaskScheduler {
  private emailService: EmailService
  private cronJob: cron.ScheduledTask

  constructor() {
    this.emailService = new EmailService()
    this.cronJob = cron.schedule(
      '* * * * *',
      this.processScheduledTasks.bind(this)
    )
  }

  async processScheduledTasks() {
    try {
      console.log(
        `[${new Date().toISOString()}] Running scheduled task processing`
      )

      const currentDate = new Date()
      const tasks = await prisma.task.findMany({
        where: {
          status: {
            in: [TaskStatus.PENDING, TaskStatus.FAILED]
          },
          scheduledAt: {
            lte: currentDate
          }
        },
        include: {
          campaign: {
            include: {
              contacts: true
            }
          },
          email: {
            include: {
              contact: true
            }
          }
        }
      })

      console.log(`Found ${tasks.length} tasks due in the current minute`)

      let processed = 0
      let failed = 0

      for (const task of tasks) {
        try {
          await prisma.task.update({
            where: { id: task.id },
            data: {
              status: TaskStatus.PROCESSING,
              error:
                task.status === TaskStatus.FAILED
                  ? `Retrying previously failed task: ${task.error}`
                  : null
            }
          })

          await this.processTask(task)
          processed++
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error)
          failed++

          await prisma.task.update({
            where: { id: task.id },
            data: {
              status: TaskStatus.FAILED,
              error: error instanceof Error ? error.message : 'Unknown error',
              processedAt: new Date()
            }
          })

          // Update email status to FAILED if this was a send email task
          if (task.type === TaskType.SEND_EMAIL && task.email?.id) {
            await prisma.email.update({
              where: { id: task.email.id },
              data: {
                status: EmailStatus.FAILED
              }
            })
          }
        }
      }

      console.log(
        `Task processing completed: ${processed} processed, ${failed} failed`
      )
    } catch (error) {
      console.error('Error in task scheduler:', error)
    }
  }

  private async processTask(
    task: Task & {
      campaign?:
        | (Campaign & {
            contacts: Contact[]
          })
        | null
      email?:
        | (Email & {
            contact: Contact
          })
        | null
    }
  ) {
    try {
      switch (task.type) {
        case TaskType.SEND_EMAIL:
          if (!task.email?.id)
            throw new Error('Email ID not found for SEND_EMAIL task')

          const email = await prisma.email.findUnique({
            where: { id: task.email.id },
            include: { campaign: true, contact: true }
          })

          if (!email) throw new Error(`Email not found for task ${task.id}`)

          if (!email.campaign)
            throw new Error(`Campaign not found for email ${email.id}`)

          if (email.contact.status !== ContactStatus.SUBSCRIBED) {
            return {
              message: 'Contact is not subscribed',
              status: 400
            }
          }

          // Process the email
          if (process.env.NODE_ENV === 'development') {
            await this.emailService.sendEmailToMailHog({
              from: email.from || process.env.DEFAULT_FROM!,
              to: email.contact.email,
              subject: email.subject,
              body: email.body
            })

            // Update email status even in development mode
            await prisma.email.update({
              where: { id: email.id },
              data: {
                status: EmailStatus.SENT,
                sentAt: new Date()
              }
            })
          } else {
            const result = await this.emailService.sendEmail({
              from: email.from || process.env.DEFAULT_FROM!,
              to: email.contact.email,
              subject: email.subject,
              body: email.body
            })

            // Update email status
            await prisma.email.update({
              where: { id: email.id },
              data: {
                status: EmailStatus.SENT,
                sentAt: new Date()
              }
            })
          }
          break
        default:
          throw new Error(`Unsupported task type: ${task.type}`)
      }

      // Mark task as completed
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.COMPLETED,
          processedAt: new Date(),
          error: null // Clear any previous error messages
        }
      })
    } catch (error) {
      // Update task status to FAILED
      await prisma.task.update({
        where: { id: task.id },
        data: {
          status: TaskStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date()
        }
      })

      // Update email status to FAILED if this was a send email task
      if (task.type === TaskType.SEND_EMAIL && task.email?.id) {
        await prisma.email.update({
          where: { id: task.email.id },
          data: {
            status: EmailStatus.FAILED
          }
        })
      }

      // Re-throw the error to be caught by the outer catch block
      throw error
    }
  }

  start() {
    this.cronJob.start()
    console.log('Task scheduler started')
  }

  stop() {
    this.cronJob.stop()
    console.log('Task scheduler stopped')
  }
}
