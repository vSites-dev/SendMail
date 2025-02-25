import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";
import { DomainStatus } from "@prisma/client";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const domainRouter = createTRPCRouter({
  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.domain.findMany({
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
        ctx.db.domain.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        ctx.db.domain.count({
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
      return await ctx.db.domain.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: check if domain is attached to any active scheduled campaign/email

        await ctx.db.domain.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting domain", e);
        return {
          success: false,
          error: "Hiba történt a domain törlése során.",
        };
      }
    }),

  updateStatus: authedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "VERIFIED",
          "FAILED",
          "DKIM_PENDING",
          "DKIM_VERIFIED",
          "DKIM_FAILED",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.domain.update({
          where: { id: input.id },
          data: { status: input.status as DomainStatus },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating domain status", e);
        return {
          success: false,
          error: "Hiba történt a domain státuszának frissítése során.",
        };
      }
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        status: z.enum([
          "PENDING",
          "VERIFIED",
          "FAILED",
          "DKIM_PENDING",
          "DKIM_VERIFIED",
          "DKIM_FAILED",
        ]),
        dkimTokens: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.domain.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            status: input.status as DomainStatus,
            dkimTokens: input.dkimTokens,
          },
        });

        return {
          id: input.id,
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating domain", e);
        return {
          success: false,
          error: "Hiba történt a domain frissítése során.",
        };
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        dkimTokens: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newDomain = await ctx.db.domain.create({
          data: {
            name: input.name,
            dkimTokens: input.dkimTokens,
            projectId: ctx.session.activeProjectId,
          },
          select: { id: true },
        });

        return {
          success: true,
          id: newDomain.id,
        };
      } catch (error) {
        console.error("Error creating domain:", error);
        return {
          success: false,
          error: "Hiba történt a domain létrehozása során.",
        };
      }
    }),
});

type DomainRouter = typeof domainRouter;

type DomainRouterOutputs = inferRouterOutputs<DomainRouter>;

export type Domain = DomainRouterOutputs["getAll"][number];
