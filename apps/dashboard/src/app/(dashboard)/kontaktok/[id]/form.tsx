"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSeparator,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  RefreshCcw,
  SquareMousePointer,
  User2,
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

export default function EditContactForm({ contact }: { contact: Contact }) {
  const utils = api.useUtils();
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const { mutateAsync: updateContact } = api.contact.update.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: contact.email,
      name: contact.name || "",
      status: contact.status,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    console.log(values);

    const res = await updateContact({
      id: contact!.id,
      ...values,
    });

    if (res && res.id) {
      utils.contact.getForTable.invalidate();
      utils.contact.getAll.invalidate();

      toast.success("Kontakt sikeresen frissítve!");
      router.push(`/kontaktok`);
    } else {
      console.error(res);
      toast.error("Hiba történt a kontakt frissítése során!");
    }

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-[500px] mx-auto my-4">
          <CardHeader>
            <CardTitle className="flex gap-3 items-center">
              <User2 className="size-6" />
              Kontakt szerkesztése
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
                                contactStatuses[value].color,
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

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              Frissítés
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
