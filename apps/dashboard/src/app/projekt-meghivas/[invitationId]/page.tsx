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

  const invitation = await api.project.getInvitationById({
    invitationId: invitationId,
  })

  if (session) {
    if (session.user.email === invitation.user.email) {
      try {
        console.log("trying to accept the invitation", invitationId)

        const res = await auth.api.acceptInvitation({
          body: {
            invitationId: invitationId,
          }
        })

        console.log(res)

        // const existingMember = await db.member.findFirst({
        //   where: {
        //     organizationId: invitation.organizationId,
        //     userId: session.user.id,
        //   },
        // });

        // // if (!existingMember) {
        // //   await db.member.create({
        // //     data: {
        // //       id: crypto.randomUUID(),
        // //       organizationId: invitation.organizationId,
        // //       userId: session.user.id,
        // //       role: invitation.role || "member",
        // //       createdAt: new Date(),
        // //     },
        // //   });
        // // }

        // // await db.invitation.update({
        // //   where: { id: invitationId },
        // //   data: { status: "accepted" },
        // // });

        console.log("invitation accepted successfully")

        return redirect("/");
      } catch (error) {
        console.error("Error accepting invitation:", error);
      }
    } else {
      await auth.api.signOut({ headers: await headers() });
    }
  }

  const emailExists = await api.admin.checkEmailExists({
    email: invitation.email,
  });

  return (
    <main className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-2 md:shadow-xl py-8">
      <div className="z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        {emailExists ? (
          <InvitationSignIn invitation={invitation} />
        ) : (
          <InvitationRegistration invitation={invitation} />
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
