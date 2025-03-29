import { auth } from "@/lib/auth/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { InvitationRegistration } from "./signup-form";
import { InvitationSignIn } from "./signin-form";
import { headers } from "next/headers";
import { InvitationData } from "@/types";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";

export default async function ProjectInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const session = await auth.api.getSession({ headers: await headers() })

  // Find the invitation
  const invitation = await db.invitation.findUnique({
    where: { id: invitationId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logo: true,
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

  // If invitation doesn't exist or has expired, redirect to home
  if (!invitation || invitation.expiresAt < new Date()) {
    console.log("invitation doesn't exist or has expired")
    return redirect("/");
  }

  // If user is already logged in
  if (session) {
    // If the logged-in user's email matches the invitation email, accept the invitation
    if (session.user.email === invitation.email) {
      try {
        console.log("trying to accept the invitation", invitationId)

        // Check if the user is already a member of the organization
        const existingMember = await db.member.findFirst({
          where: {
            organizationId: invitation.organizationId,
            userId: session.user.id,
          },
        });

        if (!existingMember) {
          // Accept the invitation by creating a new member record
          await db.member.create({
            data: {
              id: crypto.randomUUID(),
              organizationId: invitation.organizationId,
              userId: session.user.id,
              role: invitation.role || "member",
              createdAt: new Date(),
            },
          });
        }

        // Update invitation status
        await db.invitation.update({
          where: { id: invitationId },
          data: { status: "accepted" },
        });

        console.log("invitation accepted successfully")

        // Redirect to dashboard
        return redirect("/");
      } catch (error) {
        console.error("Error accepting invitation:", error);
      }
    } else {
      // If the logged-in user has a different email, sign them out
      await auth.api.signOut({ headers: await headers() });
    }
  }

  // Prepare invitation data for the form
  const invitationData: InvitationData = {
    id: invitation.id,
    organization: {
      id: invitation.organizationId,
      name: invitation.organization.name,
      logo: invitation.organization.logo,
    },
    email: invitation.email,
    role: invitation.role,
    inviter: {
      id: invitation.inviterId,
      name: invitation.user.name,
      email: invitation.user.email,
    },
  };

  let emailExists = false;
  try {
    const emailCheckResult = await api.admin.checkEmailExists({
      email: invitation.email,
    });
    emailExists = emailCheckResult.exists;
    console.log("Email exists check:", emailExists);
  } catch (error) {
    console.error("Error checking if email exists:", error);
  }

  return (
    <main className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-2 md:shadow-xl py-8">
      <div className="z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        {emailExists ? (
          <InvitationSignIn invitation={invitationData} />
        ) : (
          <InvitationRegistration invitation={invitationData} />
        )}
      </div>

      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
        )}
      />
    </main>
  );
}
