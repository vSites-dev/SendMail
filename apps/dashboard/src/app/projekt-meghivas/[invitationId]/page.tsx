import { auth } from "@/lib/auth/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { InvitationRegistration } from "./form";
import { headers } from "next/headers";
import { InvitationData } from "@/types";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";



export default async function ProjectInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const session = await auth.api.getSession({ headers: await headers() })
  console.log("hello got sesion")

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
    return redirect("/");
  }

  // If user is already logged in
  if (session) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    // If the logged-in user's email matches the invitation email, accept the invitation
    if (user && user.email === invitation.email) {
      auth.api.acceptInvitation({
        body: {
          invitationId
        }
      })
      // // Accept the invitation
      // await db.member.create({
      //   data: {
      //     id: crypto.randomUUID(),
      //     organizationId: invitation.organizationId,
      //     userId: user.id,
      //     role: invitation.role || "member",
      //     createdAt: new Date(),
      //   },
      // });

      // // Update invitation status
      // await db.invitation.update({
      //   where: { id: invitationId },
      //   data: { status: "accepted" },
      // });

      // Redirect to dashboard
      return redirect("/");
    } else await auth.api.signOut({ headers: await headers() });
  }

  // Prepare invitation data for the registration form
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

  return (
    <main className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-2 md:shadow-xl py-8">
      <div className="z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        <InvitationRegistration invitation={invitationData} />
      </div>

      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
        )}
      />
    </main>
  );
}
