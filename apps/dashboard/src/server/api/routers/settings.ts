import { createSlug } from "@/lib/utils";
import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import { TRPCError, type inferRouterOutputs } from "@trpc/server";
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

  updateOrganization: authedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        logo: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session.session.activeOrganizationId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Nem található az aktív organizáció",
          });
        }

        const newSlug = createSlug(input.name);

        const updatedOrganization = await ctx.db.organization.update({
          where: {
            id: ctx.session.session.activeOrganizationId,
          },
          data: {
            name: input.name,
            slug: newSlug,
            logo: input.logo,
          },
        });

        const updatedProject = await ctx.db.project.update({
          where: {
            organizationId: ctx.session.session.activeOrganizationId,
          },
          data: {
            name: input.name,
          },
        });

        return {
          success: true,
          organization: updatedOrganization,
          project: updatedProject,
        };
      } catch (e) {
        console.error("Error updating organization", e);
        return {
          success: false,
          error: "Hiba történt az organizáció frissítése során.",
        };
      }
    }),
});

type SettingsRouter = typeof settingsRouter;

type SettingsRouterOutputs = inferRouterOutputs<SettingsRouter>;
