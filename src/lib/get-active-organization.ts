import { db } from "@/server/db";
import { member, organization, session } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getActiveOrganization(userId: string) {
  const [{ id: lastActiveOrganizationId } = {}] = await db
    .select({
      id: session.activeOrganizationId,
    })
    .from(session)
    .where(eq(session.userId, userId))
    .innerJoin(organization, eq(session.activeOrganizationId, organization.id))
    .orderBy(desc(session.updatedAt))
    .limit(1)
    .execute();

  if (lastActiveOrganizationId) {
    return lastActiveOrganizationId;
  }

  // if there is no previous session for the user where they had an active organization, see if they are part of any organizations and return the newest one
  const [{ id: newestOrganizationId } = {}] = await db
    .select({
      id: organization.id,
    })
    .from(organization)
    .innerJoin(member, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId))
    .orderBy(desc(organization.createdAt))
    .limit(1)
    .execute();

  return newestOrganizationId;
}
