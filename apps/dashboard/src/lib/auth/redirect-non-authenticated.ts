"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers } from "next/headers";

export default async function redirectNonAuthenticated() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("calling redirectNonAuthenticated w/: ", session);

  if (!session?.user) return redirect("/bejelentkezes");

  return;
}
