"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormField, FormItem, FormLabel, FormDescription, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { AtSign, Save, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { User } from "better-auth";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "A név legalább 2 karakterből kell álljon.",
  }),
  email: z.string().email({
    message: "Érvénytelen e-mail cím.",
  }),
  image: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PersonalSettings({ user }: { user: User }) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image || "",
    },
  });

  const { mutateAsync: updateUser } = api.settings.updateUser.useMutation();

  async function onSubmit(data: FormValues) {
    setLoading(true);

    const res = await updateUser({
      name: data.name,
      image: data.image,
    })

    if (res.success) toast.success("Beállítások frissítve!")
    else toast.error("Hiba történt a mentés során!")

    setLoading(false);

    window.location.reload();
  }

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Személyes beállítások</CardTitle>
        <CardDescription>
          Itt módosíthatod az alapvető felhasználói adataidat.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="pb-0 pt-4">
            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profil kép</FormLabel>
                    <ImageUpload
                      name="image"
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
                      <div className="relative">
                        <Input
                          className="peer ps-9"
                          placeholder="Kiss János"
                          type="text"
                          disabled={isLoading}
                          {...field}
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                          <UserIcon
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
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
                      <div className="relative">
                        <Input
                          className="peer ps-9"
                          type="email"
                          {...field}
                          readOnly
                          disabled
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
                    <FormDescription>
                      Az email címed nem módosítható.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="w-full flex justify-end border-t py-4">
            <Button type="submit" isLoading={isLoading}>
              {!isLoading && <Save className="size-4" />}
              Mentés
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card >
  )
}
