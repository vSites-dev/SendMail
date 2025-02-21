"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { createDummyProject } from "./actions";

export default function DummyOnboardingButton() {
  async function handleCreate() {
    const res = await authClient.organization.create({
      name: "Dummy Org",
      slug: "dummy-org",
      logo: "https://picsum.photos/200",
    });

    await createDummyProject(res?.data?.id!);

    window.location.reload();
  }

  return (
    <Button onClick={handleCreate}>create dummy org + project</Button>
  )
}
