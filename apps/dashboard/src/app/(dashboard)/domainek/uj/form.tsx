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
  Globe,
  Loader2,
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

const formSchema = z.object({
  name: z.string().min(2, { message: "Teljes domain szükséges" }),
});

export default function CreateDomainForm() {
  const utils = api.useUtils();
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const { mutateAsync: createDomain } = api.domain.create.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const res = await createDomain(values);

    if (res && res.id) {
      utils.domain.getAll.invalidate();
      utils.domain.getForTable.invalidate();
      utils.domain.getById.invalidate({ id: res.id });

      toast.success("Új domain hozzáadva sikeresen!");
      router.push(`/domainek`);
    } else {
      console.error(res);
      toast.error("Hiba történt a domain hozzáadása során!");
    }

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-[500px] mx-auto my-4">
          <CardHeader>
            <CardTitle className="flex gap-3 items-center">
              <Globe className="size-6" />
              Új domain hozzáadása
            </CardTitle>
          </CardHeader>

          <CardSeparator />

          <CardContent className="py-4 space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain:</FormLabel>
                  <FormControl>
                    <Input placeholder="pelda.hu" {...field} />
                  </FormControl>
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
                <PlusSquare className="size-4" />
              )}
              Létrehozás
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
