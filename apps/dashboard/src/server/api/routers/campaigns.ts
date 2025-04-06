import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import {
  CampaignStatus,
  EmailStatus,
  TaskStatus,
  TaskType,
} from "@prisma/client";

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

      const [campaigns, totalCount] = await Promise.all([
        ctx.db.campaign.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: limit,
          skip: offset,
          include: {
            contacts: {
              select: {
                id: true,
              },
            },
            emails: {
              select: {
                id: true,
              },
            },
          },
        }),
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
          },
        }),
      ]);

      // Transform the data to include counts
      const items = campaigns.map(campaign => ({
        ...campaign,
        contactsCount: campaign.contacts.length,
        emailsCount: campaign.emails.length,
        // Remove the arrays to avoid sending too much data
        contacts: undefined,
        emails: undefined,
      }));

      return {
        items,
        totalCount,
      };
    }),
    
  getByName: authedProcedure
    .input(
      z.object({
        searchText: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { searchText } = input;

      await withOrganization({
        organizationId: ctx.session.session.activeOrganizationId,
      });

      if (!searchText || searchText.trim() === "") {
        return {
          items: [],
          totalCount: 0,
        };
      }

      const campaigns = await ctx.db.campaign.findMany({
        where: {
          projectId: ctx.session.activeProjectId,
          name: {
            contains: searchText,
            mode: "insensitive",
          },
        },
        include: {
          contacts: {
            select: {
              id: true,
            },
          },
          emails: {
            select: {
              id: true,
            },
          },
        },
      });

      // Transform the data to include counts
      const items = campaigns.map(campaign => ({
        ...campaign,
        contactsCount: campaign.contacts.length,
        emailsCount: campaign.emails.length,
        // Remove the arrays to avoid sending too much data
        contacts: undefined,
        emails: undefined,
      }));

      return {
        items,
        totalCount: items.length,
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

  createWithEmailsAndTasks: authedProcedure
    .input(
      z.object({
        name: z.string(),
        contactIds: z.array(z.string()),
        emailBlocks: z.array(
          z.object({
            templateId: z.string(),
            subject: z.string(),
            from: z.string(),
            date: z.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const campaign = await ctx.db.campaign.create({
          data: {
            name: input.name,
            status: CampaignStatus.SCHEDULED,
            projectId: ctx.session.activeProjectId,
            contacts: {
              connect: input.contactIds.map((id) => ({ id })),
            },
          },
        });

        const templates = await ctx.db.template.findMany({
          where: {
            id: {
              in: input.emailBlocks.map((block) => block.templateId),
            },
          },
        });

        // For each contact and each email block, create an email
        const emails = await Promise.all(
          input.contactIds.flatMap((contactId) =>
            input.emailBlocks.map(async (block) => {
              const t = templates.find(
                (template) => template.id === block.templateId,
              );
              if (!t) throw new Error("Template not found");

              return ctx.db.email.create({
                data: {
                  subject: block.subject,
                  from: block.from,
                  body: t.body,
                  status: EmailStatus.QUEUED,
                  campaignId: campaign.id,
                  contactId: contactId,
                },
              });
            }),
          ),
        );

        // For each email, create a task
        const tasks = await Promise.all(
          input.contactIds.flatMap((contactId) =>
            input.emailBlocks.map(async (block) => {
              return ctx.db.task.create({
                data: {
                  type: TaskType.SEND_EMAIL,
                  status: TaskStatus.PENDING,
                  scheduledAt: block.date,
                  projectId: ctx.session.activeProjectId,
                  campaignId: campaign.id,
                  emailId: emails.find(
                    (email) =>
                      email.from === block.from &&
                      email.subject === block.subject,
                  )?.id,
                },
              });
            }),
          ),
        );

        return {
          success: true,
          campaign,
          emails,
          tasks,
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
