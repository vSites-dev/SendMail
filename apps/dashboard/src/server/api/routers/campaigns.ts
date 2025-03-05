import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const campaignRouter = createTRPCRouter({
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
        subject: z.string(),
        body: z.string(),
        scheduledAt: z.date().optional(),
        contactIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newCampaign = await ctx.db.campaign.create({
          data: {
            name: input.name,
            subject: input.subject,
            body: input.body,
            scheduledAt: input.scheduledAt,
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
});

type CampaignRouter = typeof campaignRouter;

type CampaignRouterOutputs = inferRouterOutputs<CampaignRouter>;

export type Campaign = CampaignRouterOutputs["getAll"][number];
