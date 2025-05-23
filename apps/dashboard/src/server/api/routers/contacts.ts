import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { ContactStatus } from "@prisma/client";

export const contactRouter = createTRPCRouter({
  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.contact.findMany({
      where: {
        projectId: ctx.session.activeProjectId,
      },
    });
  }),

  getAllAvailable: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.contact.findMany({
      where: {
        projectId: ctx.session.activeProjectId,
        status: "SUBSCRIBED",
      },
    });
  }),

  getByEmail: authedProcedure
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

      const [items, totalCount] = await Promise.all([
        ctx.db.contact.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
            email: {
              contains: searchText,
              mode: "insensitive",
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        ctx.db.contact.count({
          where: {
            projectId: ctx.session.activeProjectId,
            email: {
              contains: searchText,
              mode: "insensitive",
            },
          },
        }),
      ]);

      return {
        items,
        totalCount,
      };
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
        ctx.db.contact.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        ctx.db.contact.count({
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
      return await ctx.db.contact.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.contact.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting contact", e);
        return {
          success: false,
          error: "Hiba történt a kontakt törlése során.",
        };
      }
    }),

  updateStatus: authedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.contact.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating contact status", e);
        return {
          success: false,
          error: "Hiba történt a kontakt státuszának frissítése során.",
        };
      }
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string(),
        status: z.enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.contact.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            email: input.email,
            status: input.status,
          },
        });

        return {
          id: input.id,
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating contact", e);
        return {
          success: false,
          error: "Hiba történt a kontakt frissítése során.",
        };
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        status: z
          .enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"])
          .default("SUBSCRIBED"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newContact = await ctx.db.contact.create({
          data: {
            email: input.email,
            name: input.name,
            status: input.status,
            projectId: ctx.session.activeProjectId,
          },
          select: { id: true },
        });

        return {
          success: true,
          id: newContact.id,
        };
      } catch (error) {
        console.error("Error creating contact:", error);
        return {
          success: false,
          error: "Hiba történt a kontakt létrehozása során.",
        };
      }
    }),

  getStatistics: authedProcedure.query(async ({ ctx }) => {
    // Get count of contacts by status
    const statusCounts = await ctx.db.contact.groupBy({
      by: ["status"],
      where: {
        projectId: ctx.session.activeProjectId,
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
      {} as Record<ContactStatus, number>,
    );

    // Calculate total contacts
    const total = Object.values(statistics).reduce((a, b) => a + b, 0);

    return {
      statistics,
      total,
    };
  }),

  removeFromCampaign: authedProcedure
    .input(
      z.object({
        contactId: z.string(),
        campaignId: z.string()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the campaign to verify it exists
        const campaign = await ctx.db.campaign.findUnique({
          where: {
            id: input.campaignId,
          },
          include: {
            contacts: {
              where: {
                id: input.contactId
              },
              select: {
                id: true
              }
            }
          }
        });

        if (!campaign) {
          return {
            success: false,
            error: "A kampány nem található."
          };
        }

        if (campaign.contacts.length === 0) {
          return {
            success: false,
            error: "A kontakt nem található a kampányban."
          };
        }

        // Find all queued emails for this contact in the campaign
        const emails = await ctx.db.email.findMany({
          where: {
            campaignId: input.campaignId,
            contactId: input.contactId,
            status: "QUEUED"
          },
          select: {
            id: true
          }
        });

        // Delete all tasks related to these emails
        if (emails.length > 0) {
          await ctx.db.task.deleteMany({
            where: {
              emailId: {
                in: emails.map(email => email.id)
              }
            }
          });
        }

        // Delete all emails associated with this contact in the campaign
        await ctx.db.email.deleteMany({
          where: {
            campaignId: input.campaignId,
            contactId: input.contactId,
            status: "QUEUED"
          }
        });

        // Remove the contact from the campaign
        await ctx.db.campaign.update({
          where: {
            id: input.campaignId
          },
          data: {
            contacts: {
              disconnect: {
                id: input.contactId
              }
            }
          }
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("Error removing contact from campaign:", error);
        return {
          success: false,
          error: "Hiba történt a kontakt eltávolítása során a kampányból."
        };
      }
    }),
});

type ContactRouter = typeof contactRouter;

type ContactRouterOutputs = inferRouterOutputs<ContactRouter>;

export type Contact = ContactRouterOutputs["getAll"][number];
