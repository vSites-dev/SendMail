"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardSeparator,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusSquare,
  SquareMousePointer,
  UserPlus2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Contact, ContactStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, contactStatuses } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Érvénytelen email cím" }),
  name: z.string().min(2, { message: "Teljes név szükséges" }),
  status: z
    .enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"])
    .default("SUBSCRIBED"),
});

export default function NewContactForm() {
  const utils = api.useUtils();
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const { mutateAsync: createContact } = api.contact.create.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      status: "SUBSCRIBED",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const res = await createContact(values);

    if (res && res.id) {
      utils.contact.getAll.invalidate();
      utils.contact.getForTable.invalidate();
      utils.contact.getById.invalidate({ id: res.id });

      toast.success("Új kontakt létrehozva!");
      router.push(`/kontaktok`);
    } else {
      console.error(res);
      toast.error("Hiba történt a kontakt létrehozása során!");
    }

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-[500px] mx-auto my-4">
          <CardHeader>
            <CardTitle className="flex gap-3 items-center">
              <UserPlus2 className="size-6" />
              Új kontakt létrehozása
            </CardTitle>
          </CardHeader>

          <CardSeparator />

          <CardContent className="py-4 space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email cím</FormLabel>
                  <FormControl>
                    <Input placeholder="pelda@email.com" {...field} />
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
                  <FormLabel>Név</FormLabel>
                  <FormControl>
                    <Input placeholder="Példa név" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Státusz</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Válasszon státuszt" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ContactStatus).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                contactStatuses[value].bgColor,
                              )}
                            ></div>
                            {contactStatuses[value].label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex p-4 gap-2 justify-end">
            <Button
              onClick={() => router.back()}
              disabled={isLoading}
              variant={"outline"}
              type="button"
            >
              <ArrowLeft className="size-4" />
              Vissza
            </Button>

            <Button type="submit" isLoading={isLoading}>
              {!isLoading && <PlusSquare className="size-4" />}
              Létrehozás
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
