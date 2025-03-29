import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

export const settingsRouter = createTRPCRouter({
  updateUser: authedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedUser = await ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            name: input.name,
            image: input.image,
          },
        });

        return {
          success: true,
          user: updatedUser,
        };
      } catch (e) {
        console.error("Error updating user", e);
        return {
          success: false,
          error: "Hiba történt a felhasználó frissítése során.",
        };
      }
    }),
});

type SettingsRouter = typeof settingsRouter;

type SettingsRouterOutputs = inferRouterOutputs<SettingsRouter>;
