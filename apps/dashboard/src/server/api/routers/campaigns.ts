import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { CampaignStatus, TaskStatus, TaskType } from "@prisma/client";

export const campaignRouter = createTRPCRouter({
  scheduledCampaignsCount: authedProcedure
    .input(
      z.object({
        timeInterval: z.number(),
      }),
    )
    .query(async ({ input: { timeInterval }, ctx }) => {
      if (!ctx.session.activeProjectId) return;

      const [currentCount, previousCount] = await Promise.all([
        // current period
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
            status: CampaignStatus.SCHEDULED,
            createdAt: {
              gte: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // for previous period
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
            status: CampaignStatus.SCHEDULED,
            createdAt: {
              lt: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
              gte: new Date(Date.now() - timeInterval * 2 * 24 * 60 * 60 * 1000),
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
    return await ctx.db.campaign.findMany({
      where: {
        projectId: ctx.session.activeProjectId,
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
        ctx.db.campaign.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
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
      return await ctx.db.campaign.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.campaign.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting campaign", e);
        return {
          success: false,
          error: "Hiba történt a kampány törlése során.",
        };
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        contactIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newCampaign = await ctx.db.campaign.create({
          data: {
            name: input.name,
            status: CampaignStatus.SCHEDULED,
            projectId: ctx.session.activeProjectId,
            contacts: input.contactIds
              ? {
                  connect: input.contactIds.map((id) => ({ id })),
                }
              : undefined,
          },
          select: { id: true },
        });

        return {
          success: true,
          id: newCampaign.id,
        };
      } catch (error) {
        console.error("Error creating campaign:", error);
        return {
          success: false,
          error: "Hiba történt a kampány létrehozása során.",
        };
      }
    }),

  createWithTask: authedProcedure
    .input(
      z.object({
        name: z.string(),
        contactIds: z.array(z.string()),
        emailBlocks: z.array(
          z.object({
            templateId: z.string(),
            scheduledDate: z.date().optional(),
            scheduledTime: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create the campaign with status SCHEDULED
        const campaign = await ctx.db.campaign.create({
          data: {
            name: input.name,
            status: CampaignStatus.SCHEDULED,
            projectId: ctx.session.activeProjectId,
            // Connect contacts to the campaign
            contacts: {
              connect: input.contactIds.map((id) => ({ id })),
            },
          },
        });

        // Create a task for sending the campaign
        // Using the first email block's scheduled date/time or current time if not provided
        const firstBlock = input.emailBlocks[0];
        let scheduledAt = new Date();

        if (firstBlock?.scheduledDate) {
          scheduledAt = new Date(firstBlock.scheduledDate);

          // If time is provided, parse and set it
          if (firstBlock.scheduledTime) {
            const timeParts = firstBlock.scheduledTime.split(":").map(Number);
            const hours = timeParts[0] || 0;
            const minutes = timeParts[1] || 0;
            const seconds = timeParts[2] || 0;

            scheduledAt.setHours(hours, minutes, seconds);
          }
        }

        const task = await ctx.db.task.create({
          data: {
            type: TaskType.SEND_CAMPAIGN,
            status: TaskStatus.PENDING,
            scheduledAt,
            projectId: ctx.session.activeProjectId,
            campaignId: campaign.id, // Use campaignId directly rather than connect syntax
          },
        });

        return {
          success: true,
          campaign,
          task,
        };
      } catch (error) {
        console.error("Error creating campaign with task:", error);
        return {
          success: false,
          error: "Hiba történt a kampány és feladat létrehozása során.",
        };
      }
    }),
});

type CampaignRouter = typeof campaignRouter;

type CampaignRouterOutputs = inferRouterOutputs<CampaignRouter>;

export type Campaign = CampaignRouterOutputs["getAll"][number];
