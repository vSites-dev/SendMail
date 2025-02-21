"use server";

import { db } from "@/server/db";

export async function createDummyProject(orgId: string) {
  return await db.project.create({
    data: {
      name: `Dummy Project ${Math.floor(Math.random() * 1000)}`,
      organizationId: orgId,
    },
  });
}
