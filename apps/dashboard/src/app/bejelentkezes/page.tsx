import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { SignInForm } from "./form";
import redirectAuthenticated from "@/lib/auth/redirect-authenticated";

export default async function SignInPage() {
  await redirectAuthenticated()

  return (
    <main className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-2 md:shadow-xl py-8">
      <div className="z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        <SignInForm />
      </div>

      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
        )}
      />
    </main>
  );
}
