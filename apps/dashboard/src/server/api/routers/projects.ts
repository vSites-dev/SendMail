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

  getFullOrganization: authedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.session.activeOrganizationId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nem található az aktív organizáció",
      });
    }

    const data = await ctx.db.organization.findUnique({
      where: {
        id: ctx.session.session.activeOrganizationId,
      },
      include: {
        project: true,
        invitations: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!data || !data.project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nem található a projekt",
      });
    } else return data;
  }),

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

      return invitation;
    }),

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

  checkUsersRole: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    if (!ctx.session.session.activeOrganizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization ID is required",
      });
    }

    const member = await ctx.db.member.findFirst({
      where: {
        user: {
          email: ctx.session.user.email,
        },
        organizationId: ctx.session.session.activeOrganizationId!,
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Member not found for the current user in this project",
      });
    }

    return member.role.toUpperCase();
  }),
});

type ProjectRouter = typeof projectRouter;

type ProjectRouterOutputs = inferRouterOutputs<ProjectRouter>;

export type FullOrganization = ProjectRouterOutputs["getFullOrganization"];
export type GetInvitationById = ProjectRouterOutputs["getInvitationById"];
