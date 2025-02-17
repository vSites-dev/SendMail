import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";

export default async function redirectNonAuthenticated() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect("/bejelentkezes");

  return;
}
