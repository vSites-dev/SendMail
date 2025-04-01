import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";
import { EmailStatus } from "@prisma/client";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const emailRouter = createTRPCRouter({
  emailsAndClicksChartData: authedProcedure
    .input(
      z.object({
        timeInterval: z.number(),
      }),
    )
    .query(async ({ input: { timeInterval }, ctx }) => {
      if (!ctx.session.activeProjectId) return [];

      // Generate date series for the specified interval
      const emailsByDate = await ctx.db.$queryRaw`
        SELECT
          dates.date AS date,
          COALESCE(email_counts.count, 0) AS emails,
          COALESCE(click_counts.count, 0) AS clicks
        FROM
          (
            SELECT
              generate_series(
                NOW()::date - ${timeInterval} * INTERVAL '1 day',
                NOW()::date,
                INTERVAL '1 day'
              ) AS date
          ) AS dates
        LEFT JOIN
          (
            SELECT
              DATE("createdAt") AS date,
              COUNT(*) AS count
            FROM
              "emails"
            WHERE
              "emails"."contactId" IN (
                SELECT id FROM "contacts" WHERE "projectId" = ${ctx.session.activeProjectId}
              )
              AND "createdAt" >= NOW() - ${timeInterval} * INTERVAL '1 day'
            GROUP BY
              DATE("createdAt")
          ) AS email_counts
        ON
          dates.date = email_counts.date
        LEFT JOIN
          (
            SELECT
              DATE("clicks"."createdAt") AS date,
              COUNT(*) AS count
            FROM
              "clicks"
            JOIN
              "emails" ON "clicks"."emailId" = "emails"."id"
            WHERE
              "emails"."contactId" IN (
                SELECT id FROM "contacts" WHERE "projectId" = ${ctx.session.activeProjectId}
              )
              AND "clicks"."createdAt" >= NOW() - ${timeInterval} * INTERVAL '1 day'
            GROUP BY
              DATE("clicks"."createdAt")
          ) AS click_counts
        ON
          dates.date = click_counts.date
        ORDER BY
          dates.date
      `;

      return (emailsByDate as any[]).map((item) => ({
        date: new Date(item.date as string | number | Date).toLocaleDateString(
          "hu-HU",
        ),
        emails: Number(item.emails),
        clicks: Number(item.clicks),
      }));
    }),
  clickCount: authedProcedure
    .input(
      z.object({
        timeInterval: z.number(),
      }),
    )
    .query(async ({ input: { timeInterval }, ctx }) => {
      if (!ctx.session.activeProjectId) return;

      const [currentCount, previousCount] = await Promise.all([
        // current period
        ctx.db.click.count({
          where: {
            email: {
              campaign: {
                projectId: ctx.session.activeProjectId,
              },
            },
            createdAt: {
              gte: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // for previous period
        ctx.db.click.count({
          where: {
            email: {
              campaign: {
                projectId: ctx.session.activeProjectId,
              },
            },
            createdAt: {
              lt: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
              gte: new Date(
                Date.now() - timeInterval * 2 * 24 * 60 * 60 * 1000,
              ),
            },
          },
        }),
      ]);

      return {
        value: currentCount ?? 0,
        previousValue: previousCount ?? 0,
      };
    }),

  emailCount: authedProcedure
    .input(
      z.object({
        timeInterval: z.number(),
      }),
    )
    .query(async ({ input: { timeInterval }, ctx }) => {
      if (!ctx.session.activeProjectId) return;

      const [currentCount, previousCount] = await Promise.all([
        // current period
        ctx.db.email.count({
          where: {
            contact: {
              projectId: ctx.session.activeProjectId,
            },
            createdAt: {
              gte: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // for previous period
        ctx.db.email.count({
          where: {
            contact: {
              projectId: ctx.session.activeProjectId,
            },
            createdAt: {
              lt: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
              gte: new Date(
                Date.now() - timeInterval * 2 * 24 * 60 * 60 * 1000,
              ),
            },
          },
        }),
      ]);

      return {
        value: currentCount ?? 0,
        previousValue: previousCount ?? 0,
      };
    }),

  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.email.findMany({
      where: {
        contact: {
          projectId: ctx.session.activeProjectId,
        },
      },
      include: {
        contact: true,
        campaign: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  getForTable: authedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50),
        offset: z.number().min(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;

      await withOrganization({
        organizationId: ctx.session.session.activeOrganizationId,
      });

      const [items, totalCount] = await Promise.all([
        ctx.db.email.findMany({
          where: {
            contact: {
              projectId: ctx.session.activeProjectId,
            },
          },
          include: {
            contact: true,
            campaign: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        ctx.db.email.count({
          where: {
            contact: {
              projectId: ctx.session.activeProjectId,
            },
          },
        }),
      ]);

      return {
        items,
        totalCount,
      };
    }),

  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.email.findUnique({
        where: {
          id: input.id,
        },
        include: {
          contact: true,
          campaign: true,
          clicks: true,
        },
      });
    }),

  getStatistics: authedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Get count of emails by status
      const statusCounts = await ctx.db.email.groupBy({
        by: ["status"],
        where: {
          contact: {
            projectId: ctx.session.activeProjectId,
          },
          ...(input.id ? { campaignId: input.id } : {}),
        },
        _count: {
          id: true,
        },
      });

      // Transform the result into an object
      const statistics = statusCounts.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        },
        {} as Record<EmailStatus, number>,
      );

      // Calculate total emails
      const total = Object.values(statistics).reduce((a, b) => a + b, 0);

      return {
        statistics,
        total,
      };
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.email.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting email", e);
        return {
          success: false,
          error: "Hiba történt az email törlése során.",
        };
      }
    }),

  updateStatus: authedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "QUEUED",
          "SENT",
          "DELIVERED",
          "BOUNCED",
          "COMPLAINED",
          "FAILED",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.email.update({
          where: { id: input.id },
          data: {
            status: input.status,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating email status", e);
        return {
          success: false,
          error: "Hiba történt az email státuszának frissítése során.",
        };
      }
    }),

  // For manually sending emails
  send: authedProcedure
    .input(
      z.object({
        subject: z.string(),
        body: z.string(),
        contactIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { subject, body, contactIds } = input;

        // Create email records for each contact
        const emailPromises = contactIds.map(async (contactId) => {
          return ctx.db.email.create({
            data: {
              subject,
              body,
              status: "QUEUED",
              messageId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
              contactId,
            },
          });
        });

        const emails = await Promise.all(emailPromises);

        // TODO: Call email sending service to actually send the emails
        // This would typically be handled by a background worker or queue

        return {
          success: true,
          emailIds: emails.map((email) => email.id),
        };
      } catch (e) {
        console.error("Error sending emails", e);
        return {
          success: false,
          error: "Hiba történt az emailek kiküldése során.",
        };
      }
    }),
});

export type EmailRouterOutputs = inferRouterOutputs<typeof emailRouter>;

export type ExtendedEmail = EmailRouterOutputs["getById"];
