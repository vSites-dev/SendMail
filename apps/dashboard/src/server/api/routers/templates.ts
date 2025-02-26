import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const templateRouter = createTRPCRouter({
  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.template.findMany({
      where: {
        projectId: ctx.session.activeProjectId,
      },
    });
  }),

  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.template.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.template.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting template", e);
        return {
          success: false,
          error: "Hiba történt a sablon törlése során.",
        };
      }
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.template.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            body: input.body,
          },
        });

        return {
          id: input.id,
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating template", e);
        return {
          success: false,
          error: "Hiba történt a sablon frissítése során.",
        };
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newTemplate = await ctx.db.template.create({
          data: {
            name: input.name,
            body: input.body,
            projectId: ctx.session.activeProjectId,
          },
          select: { id: true },
        });

        return {
          success: true,
          id: newTemplate.id,
        };
      } catch (error) {
        console.error("Error creating template:", error);
        return {
          success: false,
          error: "Hiba történt a sablon létrehozása során.",
        };
      }
    }),
});

type TemplateRouter = typeof templateRouter;

type TemplateRouterOutputs = inferRouterOutputs<TemplateRouter>;

export type Template = TemplateRouterOutputs["getAll"][number];
