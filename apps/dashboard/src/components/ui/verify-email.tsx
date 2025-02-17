"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardSeparator,
} from "@/components/ui/texture-card";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowUpRightFromSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";

interface VerifyEmailProps {
  email: string;
}

export function VerifyEmail({ email }: VerifyEmailProps) {
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOpenGmail = () =>
    window.open("https://mail.google.com", "_blank");

  const handleEmailSend = async () => {
    try {
      setIsSending(true);

      const res = await authClient.sendVerificationEmail({
        email: email,
      });
      console.log(res);

      return true;
    } catch (error) {
      console.error(error);
      toast.error("Hiba történt az email küldése során.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    if (countdown === 0) {
      setCountdown(60);

      const res = await handleEmailSend();

      if (res) toast.success("Email újraküldve");
    }
  };

  return (
    <>
      <CardHeader className="space-y-3 pb-4">
        <div className="mx-auto w-min rounded-full bg-green-200/60 p-3">
          <Mail className="size-8 text-green-700" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">
          Email megerősítése
        </CardTitle>
      </CardHeader>

      <CardContent className="max-w-[420px] space-y-2 text-center text-base text-muted-foreground">
        <p>
          Elküldtük a megerősítő emailt a megadott címre. Kérjük, kattintson a
          levélben található linkre az email címe megerősítéséhez.
        </p>
      </CardContent>

      <CardFooter className="flex-col pt-4">
        <Button type="button" className="w-full" onClick={handleOpenGmail}>
          Gmail megnyitása
          <ArrowUpRightFromSquare className="size-4" />
        </Button>
      </CardFooter>

      <CardSeparator />

      <div className="overflow-hidden rounded-b-[20px] bg-stone-100 pt-px dark:bg-neutral-800">
        <div className="flex flex-col items-center justify-center">
          <div className="px-2 py-2">
            <div className="text-center text-sm text-muted-foreground">
              Nem érkezett meg?{" "}
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isSending}
                className={`text-primary ${countdown > 0 || isSending ? "cursor-not-allowed opacity-50" : "hover:underline"}`}
              >
                {countdown > 0
                  ? `${countdown}mp múlva újraküldheti`
                  : "Újraküldés"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
