import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { member, organization, session } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const organizationRouter = createTRPCRouter({
  getActiveOrganization: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const [{ id: lastActiveOrganizationId } = {}] = await ctx.db
        .select({
          id: session.activeOrganizationId,
        })
        .from(session)
        .where(eq(session.userId, input.userId))
        .orderBy(desc(session.updatedAt))
        .limit(1)
        .execute();

      if (lastActiveOrganizationId) {
        return { organizationId: lastActiveOrganizationId };
      }

      // if there is no previous session for the user where they had an active organization, see if they are part of any organizations and return the newest one
      const [{ id: newestOrganization } = {}] = await ctx.db
        .select({
          id: organization.id,
        })
        .from(organization)
        .innerJoin(member, eq(organization.id, member.organizationId))
        .where(eq(member.userId, input.userId))
        .orderBy(desc(organization.createdAt))
        .limit(1)
        .execute();

      return { organizationId: newestOrganization };
    }),
});
