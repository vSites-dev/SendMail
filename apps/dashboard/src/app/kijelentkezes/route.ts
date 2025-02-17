import { auth } from "@/lib/auth/auth";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const headers = await getHeaders();

  const session = await auth.api.getSession({
    headers: headers,
  });

  if (session?.user) {
    await auth.api.signOut({
      headers: headers,
    });

    return redirect("/bejelentkezes");
  }

  return redirect("/");
}
