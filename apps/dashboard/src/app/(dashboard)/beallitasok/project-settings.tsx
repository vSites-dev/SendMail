"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormDescription, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Plus, Save, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { User } from "better-auth";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Organization, Project } from "@prisma/client";
import { FullOrganization } from "@/server/api/routers/projects";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MemberInvite, MemberRole } from "@/types";
import { Label } from "@/components/ui/label";
import MemberInviteInput from "@/app/uj-projekt/2/member-invite-input";
import { authClient } from "@/lib/auth/client";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "A projekt név legalább 3 karakterből kell álljon.",
  }),
  logo: z.string(),
  members: z.array(z.object({
    email: z.string().email(),
    role: z.enum(["owner", "admin", "member"]),
  }))
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectSettings({ user, fullOrganization }: { user: User, fullOrganization: FullOrganization }) {
  if (!fullOrganization.project) {
    return <div></div>
  }

  const [isLoading, setLoading] = useState(false);
  const utils = api.useUtils()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fullOrganization.project.name,
      logo: fullOrganization.logo || "",
      members: fullOrganization.members.map((member) => ({
        email: member.user.email,
        role: member.role as any
      }))
    },
  });

  const { mutateAsync: updateOrganization } = api.settings.updateOrganization.useMutation();

  async function onSubmit(data: FormValues) {
    setLoading(true);

    if (data.members.length > 0 && data.members.some((member) => !member.email || !member.role)) {
      toast.error("Mindegyik tagnak szükséges megadni az email címét és szerepkörét!")
      setLoading(false);
      return;
    }

    toast.loading("Beállítások mentése...", { id: "settings" })

    const res = await updateOrganization({
      name: data.name,
      logo: data.logo,
    })

    toast.dismiss("settings")
    if (res.success) toast.success("Beállítások frissítve!", { id: "settings" })
    else toast.error("Hiba történt a mentés során!", { id: "settings" })

    const newMembers = data.members.filter(member => !fullOrganization.members.some(orgMember => orgMember.user.email === member.email));
    if (newMembers.length > 0) {
      toast.loading("Új tagok behívása", { id: "new-members" })
      try {

        for (const member of newMembers) {
          await authClient.organization.inviteMember({
            email: member.email,
            role: member.role,
            organizationId: fullOrganization.id
          })
        }
        toast.dismiss("new-members")
        toast.success("Új tagok behívása sikeres!", { id: "new-members" })
      } catch (error) {
        toast.error("Hiba történt az új tagok behívása során!", { id: "new-members" })
      }
    }

    utils.project.invalidate();
    setLoading(false);
    // window.location.reload();
  }

  const handleAddMember = () => {
    form.setValue("members", [...form.getValues("members"), { email: "", role: "member" }]);
  };


  const isEmailDisabled = (email: string) => fullOrganization.members.some((member) => member.user.email === email);
  const isRoleDisabled = (role: MemberRole) => role === "owner";
  const isDeleteDisabled = (email: string) => email === user.email;

  const handleEmailChange = (id: number, email: string) => {
    form.setValue("members", form.getValues("members").map((member, index) => {
      if (index === id - 1) return { ...member, email };
      return member;
    }));
  };
  const handleRoleChange = (id: number, role: MemberRole) => {
    form.setValue("members", form.getValues("members").map((member, index) => {
      if (index === id - 1) return { ...member, role };
      return member;
    }));
  };
  const handleRemove = (id: number) => {
    form.setValue("members", form.getValues("members").filter((_, index) => index !== id - 1));
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Projekt beállítások</CardTitle>
        <CardDescription>
          Itt módosíthatod az alapvető projekt adataidat.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="pb-0 pt-4">
            <div className="flex flex-1 flex-col gap-4">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logó</FormLabel>
                    <ImageUpload
                      name="logo"
                      control={form.control}
                      label="Logó feltöltése"
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

              <div className="relative">
                <Label className="text-neutral-800 tracking-wide text-[15px]">Tagok</Label>
                {form.watch("members").length > 0 && (
                  <div
                    className="flex items-center mb-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex-grow">Email cím</span>
                    <span className="absolute right-[154px]">Szerepkör</span>
                  </div>
                )}

                <div className="space-y-2">
                  {form.watch("members").map((member, index) => (
                    <MemberInviteInput
                      key={index}
                      id={index + 1}
                      email={member.email}
                      role={member.role as MemberRole}
                      shouldAnimate={false}
                      emailDisabled={isEmailDisabled(member.email)}
                      deleteDisabled={isDeleteDisabled(member.email)}
                      roleDisabled={isRoleDisabled(member.role as MemberRole)}
                      onEmailChange={(email) => handleEmailChange(index + 1, email)}
                      onRoleChange={(role) => handleRoleChange(index + 1, role)}
                      onRemove={() => handleRemove(index + 1)}
                    />
                  ))}
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={handleAddMember}
                    className="disabled:bg-gray-200 w-full"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-2">Meghívott hozzáadása</span>
                  </Button>
                </div>
              </div>
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
