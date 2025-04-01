"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AtSign,
  Plus,
  Save,
  User as UserIcon,
} from "lucide-react";
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
import MemberInviteInput from "@/components/ui/member-invite-input";
import { authClient } from "@/lib/auth/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "A projekt név legalább 3 karakterből kell álljon.",
  }),
  logo: z.string(),
  members: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(["owner", "admin", "member"]),
      id: z.string().optional(),
      status: z.enum(["active", "pending"]).optional(),
    }),
  ),
  newMembers: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(["owner", "admin", "member"]),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectSettings({
  user,
  fullOrganization,
}: {
  user: User;
  fullOrganization: FullOrganization;
}) {
  if (!fullOrganization.project) return <div></div>;

  const [isLoading, setLoading] = useState(false);
  const [showOwnerWarning, setShowOwnerWarning] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    id: number;
    role: MemberRole;
  } | null>(null);
  const utils = api.useUtils();

  // Prepare combined member data (active members + pending invitations)
  const activeMembers = fullOrganization.members.map((member) => ({
    email: member.user.email,
    role: member.role as MemberRole,
    id: member.id,
    status: "active" as const,
  }));

  const pendingInvitations = fullOrganization.invitations
    .filter(
      (invite) =>
        !activeMembers.some((member) => member.email === invite.email),
    )
    .map((invite) => ({
      email: invite.email,
      role: invite.role as MemberRole,
      id: invite.id,
      status: "pending" as const,
    }));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: fullOrganization.project.name,
      logo: fullOrganization.logo || "",
      members: [...activeMembers, ...pendingInvitations],
      newMembers: [],
    },
  });

  const { mutateAsync: updateOrganization } =
    api.settings.updateOrganization.useMutation();

  async function onSubmit(data: FormValues) {
    setLoading(true);

    if (
      data.newMembers.length > 0 &&
      data.newMembers.some((member) => !member.email || !member.role)
    ) {
      toast.error(
        "Mindegyik tagnak szükséges megadni az email címét és szerepkörét!",
      );
      setLoading(false);
      return;
    }

    if (
      data.newMembers.some((newMember) =>
        data.members.some((member) => member.email === newMember.email),
      )
    ) {
      toast.error(
        "Egy vagy több új tag email címe már szerepel a meglévő tagok között!",
      );
      setLoading(false);
      return;
    }

    toast.loading("Beállítások mentése...", { id: "settings" });

    const res = await updateOrganization({
      name: data.name,
      logo: data.logo,
    });

    toast.dismiss("settings");
    if (res.success)
      toast.success("Beállítások frissítve!", { id: "settings" });
    else toast.error("Hiba történt a mentés során!", { id: "settings" });

    if (data.newMembers.length > 0) {
      toast.loading("Új tagok behívása", { id: "new-members" });
      try {
        for (const member of data.newMembers) {
          await authClient.organization.inviteMember({
            email: member.email,
            role: member.role,
            organizationId: fullOrganization.id,
          });
        }
        toast.dismiss("new-members");
        toast.success("Új tagok behívása sikeres!", { id: "new-members" });

        window.location.reload();
      } catch (error) {
        toast.error("Hiba történt az új tagok behívása során!", {
          id: "new-members",
        });
      }
    }

    utils.project.invalidate();
    setLoading(false);
    window.location.reload();
  }

  const isRoleDisabled = (role: MemberRole) => role === "owner";
  const isDeleteDisabled = (email: string, role: MemberRole) => email === user.email || role === "owner";

  const handleMemberRoleChange = (index: number, newRole: MemberRole) => {
    const members = [...form.getValues("members")];
    if (!members[index]) return;
    members[index].role = newRole;
    form.setValue("members", members);
  };

  const handleDeleteMember = (index: number) => {
    const members = [...form.getValues("members")];
    if (!members[index]) return;
    members.splice(index, 1);
    form.setValue("members", members);
  };

  const handleAddMember = () => {
    form.setValue("newMembers", [
      ...form.getValues("newMembers"),
      { email: "", role: "member" as MemberRole },
    ]);
  };
  const handleNewMemberEmailChange = (index: number, newEmail: string) => {
    const newMembers = [...form.getValues("newMembers")];
    if (!newMembers[index]) return;
    newMembers[index].email = newEmail;
    form.setValue("newMembers", newMembers);
  };
  const handleNewMemberRoleChange = (index: number, newRole: MemberRole) => {
    const newMembers = [...form.getValues("newMembers")];
    if (!newMembers[index]) return;
    newMembers[index].role = newRole;
    form.setValue("newMembers", newMembers);
  };
  const handleNewMemberDelete = (index: number) => {
    const newMembers = [...form.getValues("newMembers")];
    if (!newMembers[index]) return;
    newMembers.splice(index, 1);
    form.setValue("newMembers", newMembers);
  };

  return (
    <>
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
                  <Label className="text-neutral-800 tracking-wide text-[15px] mb-4 block">
                    Tagok
                  </Label>
                  {form.watch("members").length > 0 && (
                    <div className="flex items-center mb-1 mt-1 text-sm text-muted-foreground">
                      <span className="flex-grow">Email cím</span>
                      <span className="absolute right-[154px]">Szerepkör</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {form.watch("members")?.map((member, index) => (
                      <div key={index} className="flex items-center">
                        <div className="mr-2 flex-shrink-0">
                          {member.status === "pending" && (
                            <div
                              className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"
                              title="Függőben lévő meghívó"
                            ></div>
                          )}
                          {member.status === "active" && (
                            <div
                              className="w-2 h-2 rounded-full bg-green-500"
                              title="Aktív tag"
                            ></div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <MemberInviteInput
                            key={index}
                            id={index + 1}
                            email={member.email}
                            role={member.role as MemberRole}
                            shouldAnimate={false}
                            emailDisabled={true}
                            deleteDisabled={isDeleteDisabled(member.email, member.role as MemberRole)}
                            roleDisabled={isRoleDisabled(
                              member.role as MemberRole,
                            )}
                            onRoleChange={(role) =>
                              handleMemberRoleChange(index, role)
                            }
                            onRemove={() => handleDeleteMember(index)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {form.watch("newMembers")?.length > 0 && (
                    <>
                      <Label className="text-neutral-800 tracking-wide text-[15px] mt-6 mb-4 block">
                        Új meghívások
                      </Label>
                      <div className="flex items-center mb-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex-grow">Email cím</span>
                        <span className="absolute right-[154px]">
                          Szerepkör
                        </span>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    {form.watch("newMembers").map((member, index) => (
                      <MemberInviteInput
                        key={index}
                        id={index + 1}
                        email={member.email}
                        role={member.role as MemberRole}
                        shouldAnimate={true}
                        deleteDisabled={false}
                        roleDisabled={false}
                        onRemove={() => handleNewMemberDelete(index)}
                        onRoleChange={(role) =>
                          handleNewMemberRoleChange(index, role)
                        }
                        onEmailChange={(email) =>
                          handleNewMemberEmailChange(index, email)
                        }
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
                      <span className="ml-2">Új meghívó hozzáadása</span>
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
      </Card>
    </>
  );
}
