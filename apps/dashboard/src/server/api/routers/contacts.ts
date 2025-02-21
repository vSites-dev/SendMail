import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const contactRouter = createTRPCRouter({
  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.contact.findMany({
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
          error: "Hiba történt a kontakt létrehozása során.",
        };
      }
    }),
});

type ContactRouter = typeof contactRouter;

type ContactRouterOutputs = inferRouterOutputs<ContactRouter>;

export type Contact = ContactRouterOutputs["getAll"][number];
