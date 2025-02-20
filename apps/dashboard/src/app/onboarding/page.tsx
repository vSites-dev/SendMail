import CreateDummyOnboardingButton from "./dummy-onboarding";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers as getHeaders } from "next/headers";
import { api } from "@/trpc/server";

export default async function OnboardingPage() {
  const headers = await getHeaders();

  const [organizations, activeOrganization] = await Promise.all([
    auth.api.listOrganizations({ headers }),
    auth.api.getFullOrganization({ headers }),
  ]);

  if (organizations.length > 0) return redirect("/")

  return (
    <div className="max-w-4xl mx-auto h-full py-6 px-4">
      <h1 className="text-2xl font-semibold">Új SendMail projekt létrehozása</h1>

      <div className="h-12"></div>

      <CreateDummyOnboardingButton />
    </div>
  )
}
