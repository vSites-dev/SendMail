"use client";

import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  onboardingProjectNameAtom,
  onboardingUploadedFileUrlAtom,
} from "@/store/global";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "A projekt név legalább 3 karakterből kell álljon.",
  }),
  logo: z.string().min(2, {
    message: "Fel kell tölteni egy logót a projekthez.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingStepOne() {
  const router = useRouter();

  const [projectName, setProjectName] = useAtom(onboardingProjectNameAtom);
  const [uploadedFileUrl, setUploadedFileUrl] = useAtom(
    onboardingUploadedFileUrlAtom,
  );
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: projectName ?? "",
      logo: uploadedFileUrl ?? "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setLoading(true);
    setProjectName(data.name);
    setUploadedFileUrl(data.logo);

    setTimeout(() => {
      router.push("/uj-projekt/2");
    }, 200);
  };

  return (
    <main className="mx-auto p-4">
      <div
        style={{ animationDuration: "500ms" }}
        className="motion-safe:animate-revealBottom"
      >
        <h1 className="title text-2xl font-semibold sm:text-xl dark:text-gray-50">
          Projekt adatai
        </h1>
        <p className="mt-6 text-gray-700 sm:text-sm dark:text-gray-300">
          A projekt alapvető adatai szükségesek a későbbi beazonosításhoz.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projekt neve</FormLabel>
                  <FormControl>
                    <Input placeholder="LeoAI..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projekt logó</FormLabel>
                  <FormControl>
                    <ImageUpload
                      name="logo"
                      control={form.control}
                      label="Projekt logó feltöltése"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="!mt-8 flex justify-end border-t pt-8">
              <Button
                className="disabled:bg-gray-200 disabled:text-gray-500"
                type="submit"
                disabled={loading}
                aria-disabled={loading}
                isLoading={loading}
              >
                Következő
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
