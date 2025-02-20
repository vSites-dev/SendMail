import { authedProcedure, createTRPCRouter } from "@/server/api/trpc";

import { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";

export const projectRouter = createTRPCRouter({
  getById: authedProcedure
    .input(
      z.object({
        organizationId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.project.findUnique({
        where: {
          organizationId: input.organizationId,
        },
      });
    }),
});

type ProjectRouter = typeof projectRouter;

type ProjectRouterOutputs = inferRouterOutputs<ProjectRouter>;
