"use server";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { headers as getHeaders } from "next/headers";

export default async function redirectAuthenticated() {
  const session = await auth.api.getSession({
    headers: await getHeaders(),
  });

  console.log("calling redirectAuthenticated w/: ", session);

  if (session) return redirect("/");

  return;
}
