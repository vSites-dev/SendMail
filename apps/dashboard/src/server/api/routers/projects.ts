import {
  authedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";

import { z } from "zod";
import type { inferRouterOutputs } from "@trpc/server";
import { TRPCError } from "@trpc/server";

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

  // Get invitation details
  getInvitationById: publicProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { id: input.invitationId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              logo: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      return invitation;
    }),

  // Check if a user exists with the provided email
  checkUserByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      return {
        exists: !!user,
      };
    }),

  // Accept invitation and add user to organization
  acceptInvitation: authedProcedure
    .input(
      z.object({
        invitationId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { id: input.invitationId },
        include: {
          organization: true,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Meghívó nem található",
        });
      }

      if (invitation.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Meghívó lejárt",
        });
      }

      // Check if user's email matches invitation email
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Felhasználó nem található",
        });
      }

      if (user.email !== invitation.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ez a meghívó egy másik email címre lett kiküldve",
        });
      }

      // Check if the user is already a member of the organization
      const existingMember = await ctx.db.member.findFirst({
        where: {
          organizationId: invitation.organizationId,
          userId: user.id,
        },
      });

      if (existingMember) {
        // Update the invitation status
        await ctx.db.invitation.update({
          where: { id: input.invitationId },
          data: { status: "accepted" },
        });

        return { success: true };
      }

      // Create a new member record
      await ctx.db.member.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: invitation.organizationId,
          userId: user.id,
          role: invitation.role || "member",
          createdAt: new Date(),
        },
      });

      // Update the invitation status
      await ctx.db.invitation.update({
        where: { id: input.invitationId },
        data: { status: "accepted" },
      });

      // Set active organization to this new organization
      await ctx.db.session.update({
        where: { id: ctx.session.user.id },
        data: { activeOrganizationId: invitation.organizationId },
      });

      return { success: true };
    }),
});

type ProjectRouter = typeof projectRouter;

type ProjectRouterOutputs = inferRouterOutputs<ProjectRouter>;
