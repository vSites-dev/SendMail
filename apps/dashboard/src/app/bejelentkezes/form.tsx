"use client";

import { Button } from "@/components/ui/button";
import { } from "@/components/ui/card";
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
import { AtSign, Eye, EyeOff, KeyRound, LogIn } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth/client";
import { VerifyEmail } from "@/components/ui/verify-email";
import { redirect, useRouter } from "next/navigation";

const formSchema = z.object({
	email: z.string().email({
		message: "Adja meg email címét",
	}),
	password: z.string().min(8, {
		message: "Adja meg jelszavát",
	}),
});

export function SignInForm() {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const [view, setView] = useState<"signIn" | "verifyEmail" | "forgotPassword">(
		"signIn",
	);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);

		const { data, error } = await authClient.signIn.email({
			email: values.email,
			password: values.password,
			rememberMe: true
		});

		if (data) router.push("/")

		if (error) {
			console.log(error);

			if (error.code === "INVALID_EMAIL_OR_PASSWORD") {
				toast.error("Érvénytelen email cím vagy jelszó");
			} else if (error.status === 403) {
				setView("verifyEmail");
			} else {
				toast.error("Valami hiba történt a bejelentkezés során");
			}

			setIsLoading(false);

			return;
		}

		setIsLoading(false);
	}

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true);
		await authClient.signIn.social({
			provider: "google"
		})
		setIsGoogleLoading(false)
	};

	return (
		<motion.div
			key="signInPage"
			initial={{ opacity: 0, scale: 0.75 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.75 }}
			transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
			className="w-full mx-auto max-w-md"

		>
			<CardStyled className="w-full">
				<AnimatePresence mode="wait">
					{view === "signIn" ? (
						<motion.div
							key="signIn"
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
											Bejelentkezés
										</CardTitle>
										<CardDescription className="text-muted-foreground">
											Jelentkezz be a fiókodba a vezérlőpult eléréséhez
										</CardDescription>
									</CardHeader>

									<CardSeparator />

									<CardContent className="space-y-4 py-8">
										<Button
											variant="outline"
											type="button"
											className="w-full text-neutral-800"
											onClick={handleGoogleSignIn}
											isLoading={isGoogleLoading || isLoading}
										>
											{!(isGoogleLoading || isLoading) && (
												<div className="h-4 w-4">
													<Image
														src="/google.svg"
														alt="google"
														width={24}
														height={24}
													/>
												</div>
											)}
											Bejelentkezés Google fiókkal
										</Button>

										<div className="relative !my-6">
											<div className="absolute inset-0 flex items-center">
												<span className="w-full border-t" />
											</div>
											<div className="relative flex justify-center text-xs uppercase">
												<span className="bg-background px-3 text-muted-foreground rounded-xl">
													Vagy
												</span>
											</div>
										</div>

										<div className="space-y-8">
											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email cím</FormLabel>
														<FormControl>
															<div className="relative">
																<Input
																	className="peer ps-9"
																	placeholder="pelda@gmail.com"
																	type="email"
																	disabled={isLoading}
																	autoComplete="off"
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
												name="password"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															<div className="flex justify-between">
																<span>Jelszó </span>
																<div className="text-center text-sm font-normal text-muted-foreground">
																	<Link
																		href="/elfelejtett-jelszo"
																		className="hover:underline"
																	>
																		Elfelejtetted a jelszavad?
																	</Link>
																</div>
															</div>
														</FormLabel>
														<FormControl>
															<div className="relative flex rounded-lg shadow-sm shadow-black/5">
																<Input
																	className="peer -me-px flex-1 rounded-e-none ps-9 shadow-none focus-visible:z-10"
																	type={showPassword ? "text" : "password"}
																	placeholder={showPassword ? "" : "********"}
																	disabled={isLoading}
																	autoComplete="off"
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
																		<EyeOff
																			className="h-4 w-4"
																			aria-hidden="true"
																		/>
																	) : (
																		<Eye
																			className="h-4 w-4"
																			aria-hidden="true"
																		/>
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
										<Button
											type="submit"
											className="w-full"
											isLoading={isLoading}
										>
											Bejelentkezés
											{!isLoading && <LogIn className="mr-2 h-4 w-4" />}
										</Button>

									</CardFooter>
								</form>
							</Form>

							<CardSeparator />

							<div className="overflow-hidden rounded-b-[20px] bg-stone-100 pt-px dark:bg-neutral-800">
								<div className="flex flex-col items-center justify-center">
									<div className="px-2 py-2">
										<div className="text-center text-sm text-muted-foreground">
											Még nincs fiókod?{" "}
											<Link
												href="/regisztracio"
												className="text-primary hover:underline"
											>
												Regisztrálj itt
											</Link>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					) : (
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
