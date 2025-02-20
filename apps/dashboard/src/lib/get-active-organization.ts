import { db } from "@/server/db";

const getActiveOrganization = async (userId: string) => {
  const lastActiveOrganization = await db.session.findFirst({
    where: {
      userId,
      activeOrganizationId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    select: { activeOrganizationId: true },
  });

  if (lastActiveOrganization?.activeOrganizationId) {
    return lastActiveOrganization.activeOrganizationId;
  }

  const newestOrganization = await db.organization.findFirst({
    where: {
      members: { some: { userId } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  return newestOrganization?.id;
};

export default getActiveOrganization;
