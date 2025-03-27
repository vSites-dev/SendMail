"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";

export async function createProject(orgId: string, name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  console.log("session", session);

  const project = await db.project.create({
    data: {
      name: name,
      organizationId: orgId,
    },
  });
  console.log("created project", project);
  if (!project)
    throw new Error("Valami hiba történt a projekt létrehozása során");

  // add the owner whom created the project as member
  await auth.api.addMember({
    body: {
      userId: session!.user.id,
      role: "owner",
    },
  });
  console.log("added owner", session!.user.email);

  return project;
}
