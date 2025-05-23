export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth/auth";
import { headers as getHeaders } from "next/headers";
import Wrapper from "./wrapper";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders();

  const [organizations, activeOrganization] = await Promise.all([
    auth.api.listOrganizations({ headers }),
    auth.api.getFullOrganization({ headers }),
  ]);

  return <Wrapper organizations={organizations}>{children}</Wrapper>
}
