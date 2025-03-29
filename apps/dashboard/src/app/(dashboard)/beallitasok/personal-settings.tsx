"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel, FormDescription, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Save } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "A név legalább 2 karakterből kell álljon.",
  }),
  email: z.string().email({
    message: "Érvénytelen e-mail cím.",
  }),
  avatar: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PersonalSettings() {
  const { data: session } = authClient.useSession()

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session?.user.name,
      email: session?.user.email,
      avatar: session?.user.image || "",
    },
  });

  function onSubmit(data: FormValues) {
    console.log("Személyes beállítások mentése:", data);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Személyes beállítások</CardTitle>
        <CardDescription>
          Itt módosíthatod az alapvető felhasználói adataidat, mint például a neved és a profilképed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profil kép</FormLabel>
                    <ImageUpload
                      name="avatar"
                      control={form.control}
                      label="Profil kép feltöltése"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Név</FormLabel>
                    <FormControl>
                      <Input placeholder="Teljes neved" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ez a név lesz látható másoknak a platformon.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email cím</FormLabel>
                    <FormControl>
                      <Input disabled {...field} readOnly />
                    </FormControl>
                    <FormDescription>
                      Az email címed nem módosítható.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="w-full flex justify-end p-0">
              <Button type="submit" isLoading={isLoading}>
                {!isLoading && <Save className="size-4" />}
                Mentés
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card >
  )
}
