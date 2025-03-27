"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function acceptInvitation(invitationId: string) {
  try {
    console.log("acceptInvitation got called");

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error("Nincs bejelentkezve");
    }

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      throw new Error("A meghívó nem létezik");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("A meghívó lejárt");
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      throw new Error("Felhasználó nem található");
    }

    if (user.email !== invitation.email) {
      throw new Error("Ez a meghívó egy másik email címre lett kiküldve");
    }

    // Check if the user is already a member of the organization
    const existingMember = await db.member.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId: user.id,
      },
    });

    if (existingMember) {
      // Update the invitation status
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: "accepted" },
      });

      return { success: true };
    }

    // Create a new member record
    await db.member.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: invitation.organizationId,
        userId: user.id,
        role: invitation.role || "member",
        createdAt: new Date(),
      },
    });

    // Update the invitation status
    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "accepted" },
    });

    // Set the active organization to the new one in the session
    await db.session.update({
      where: { id: session.session.id },
      data: { activeOrganizationId: invitation.organizationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { error: (error as Error).message };
  }
}
