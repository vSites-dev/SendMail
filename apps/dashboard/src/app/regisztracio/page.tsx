import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import { SignUpForm } from "./form";

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden rounded-lg border bg-background p-2 md:shadow-xl">
      <div className="z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        <SignUpForm />
      </div>

      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
        )}
      />
    </main>
  );
}
