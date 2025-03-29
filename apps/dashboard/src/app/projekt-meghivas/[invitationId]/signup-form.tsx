"use client";

import { Button } from "@/components/ui/button";
import {
  CardStyled,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardSeparator,
} from "@/components/ui/texture-card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AtSign,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  User,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { authClient } from "@/lib/auth/client";
import { InvitationData } from "@/types";
import { acceptInvitation } from "./actions";
import { VerifyEmail } from "@/components/ui/verify-email";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Teljes név szükséges a regisztrációhoz",
    }),
    email: z.string().email({
      message: "Érvénytelen email cím formátum",
    }),
    password: z.string().min(8, {
      message: "Legalább 8 karakter hosszú kell legyen",
    }),
  })
  .refine(
    (data) =>
      data.name.includes(" ") && (data.name.split(" ")[1] ?? "").length > 2,
    {
      message: "Teljes név szükséges a regisztrációhoz.",
      path: ["name"],
    },
  );

interface InvitationRegistrationProps {
  invitation: InvitationData;
}

export function InvitationRegistration({ invitation }: InvitationRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<"signUp" | "verifyEmail">(
    "signUp",
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: invitation.email,
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (error) {
        console.log("error", error);

        if (error.code === "USER_WITH_THIS_EMAIL_ALREADY_EXISTS") {
          toast.error("Ez az email cím már regisztrálva van!");
        } else {
          toast.error("Hiba történt a regisztráció során, kérjük, próbálja újra később.");
        }

        setIsLoading(false);
        return;
      }

      if (data.user.id) {
        setView("verifyEmail");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Hiba történt a regisztráció során, kérjük, próbálja újra később.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      key="invitationRegistrationPage"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
      className="w-full mx-auto max-w-md"
    >
      <CardStyled className="w-full">
        <AnimatePresence mode="wait">
          {view === "signUp" && (
            <motion.div
              key="registration"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardHeader className="space-y-3 pb-4">
                    <div className="h-12">
                      <Image
                        src="/brand/logo.svg"
                        alt="logo"
                        width={140}
                        height={50}
                        quality={100}
                      />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      Csatlakozás meghívással
                    </CardTitle>

                    <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950/40">
                      <div className="flex justify-between items-center gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-violet-800 dark:text-violet-300">
                            {invitation.organization.name}
                          </h3>
                          <p className="text-xs text-violet-600 dark:text-violet-400">
                            {invitation.inviter.name} ({invitation.inviter.email}) meghívta Önt
                          </p>
                        </div>
                        {invitation.organization.logo && (
                          <div className="h-12 w-12 rounded-md overflow-hidden">
                            <Image
                              src={invitation.organization.logo}
                              alt={`${invitation.organization.name} logó`}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <CardDescription className="text-muted-foreground mt-4 block">
                      <span className="block mt-2">
                        Hozzon létre egy ingyenes SendMail fiókot a meghívó elfogadásához.
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardSeparator />

                  <CardContent className="space-y-4 py-8">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">
                              Email cím
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  className="peer ps-9"
                                  placeholder={invitation.email}
                                  type="email"
                                  disabled={true} // Email is read-only
                                  {...field}
                                />
                                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                                  <AtSign
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Teljes név <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  className="peer ps-9"
                                  placeholder="Kiss János"
                                  type="text"
                                  disabled={isLoading}
                                  {...field}
                                />
                                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                                  <User
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <div className="flex justify-between">
                                <span>
                                  Jelszó <span className="text-destructive">*</span>
                                </span>
                              </div>
                            </FormLabel>
                            <FormControl>
                              <div className="relative flex rounded-lg shadow-sm shadow-black/5">
                                <Input
                                  className="peer -me-px flex-1 rounded-e-none ps-9 shadow-none focus-visible:z-10"
                                  type={showPassword ? "text" : "password"}
                                  placeholder={showPassword ? "" : "********"}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <div className="pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                                  <KeyRound
                                    size={16}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="inline-flex items-center rounded-e-lg border border-neutral-950/25 bg-background px-3 text-sm font-medium text-foreground outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {!showPassword ? (
                                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                                  ) : (
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>

                  <CardSeparator />

                  <CardFooter className="flex-col space-y-2 pt-4">
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                      Regisztráció és csatlakozás
                      {!isLoading && <UserCheck className="ml-2 h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </form>
              </Form>

              <CardSeparator />

              <div className="overflow-hidden rounded-b-[20px] bg-stone-100 pt-px dark:bg-neutral-800">
                <div className="flex flex-col items-center justify-center">
                  <div className="px-2 py-2">
                    <div className="text-center text-sm text-muted-foreground">
                      Már van fiókja?{" "}
                      <Link
                        href="/bejelentkezes"
                        className="text-primary hover:underline"
                      >
                        Jelentkezzen be itt
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === "verifyEmail" && (
            <motion.div
              key="verifyEmail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VerifyEmail
                email={form.getValues("email")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardStyled>
    </motion.div>
  );
}
