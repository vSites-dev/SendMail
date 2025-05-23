"use client";

import { Button } from "@/components/ui/button";
import {
  onboardingMemberInvitesAtom,
  onboardingProjectNameAtom,
  onboardingUploadedFileUrlAtom,
} from "@/store/global";
import { MemberRole } from "@/types";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Rocket } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import MemberInviteInput from "@/components/ui/member-invite-input";
import { authClient } from "@/lib/auth/client";
import { createProject } from "../actions";
import { createSlug } from "@/lib/utils";

export default function OnboardingStepTwo() {
  const router = useRouter();

  const [memberInvites, setMemberInvites] = useAtom(
    onboardingMemberInvitesAtom,
  );
  const [name, setName] = useAtom(onboardingProjectNameAtom);
  const [logo, setLogo] = useAtom(onboardingUploadedFileUrlAtom);

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!name || !logo) router.push("/uj-projekt/1");
  }, [name, logo]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const org = await authClient.organization.create({
        name,
        slug: createSlug(name),
        logo: logo ?? undefined,
      });
      console.log("created org", org);
      if (!org.data)
        throw new Error("Valami hiba történt a projekt létrehozása során");

      const res = await createProject(org.data.id, name);

      if (!res) {
        toast.error("Hiba történt a projekt létrehozásakor");
        setLoading(false);
        return;
      }

      toast.success("A projekt sikeresen létrehozva");

      if (memberInvites && memberInvites.length > 0) {
        for (const invite of memberInvites) {
          if (invite.email && invite.role) {
            try {
              console.log("sending invite to: ", invite.email);
              await authClient.organization.inviteMember({
                email: invite.email,
                role: invite.role,
                organizationId: org.data.id,
              });
            } catch (error) {
              console.error(`Failed to invite ${invite.email}:`, error);
              toast.error(`Hiba történt ${invite.email} meghívása során`);
            }
          }
        }
      }

      router.push("/");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Hiba történt a projekt létrehozása során");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setMemberInvites((prev) => [
      ...(prev ?? []),
      { email: "", role: MemberRole.member },
    ]);
  };

  const handleEmailChange = (id: number, email: string) => {
    setMemberInvites((prev) => {
      if (!prev) return null;
      const newInvites = [...prev];
      newInvites[id - 1]!.email = email;
      return newInvites;
    });
  };

  const handleRoleChange = (id: number, role: MemberRole) => {
    setMemberInvites((prev) => {
      if (!prev) return null;
      const newInvites = [...prev];
      newInvites[id - 1]!.role = role;
      return newInvites;
    });
  };

  const handleRemove = (id: number) => {
    setMemberInvites((prev) => {
      if (!prev) return null;
      const newInvites = [...prev];
      newInvites.splice(id - 1, 1);
      return newInvites;
    });
  };

  return (
    <div className="mx-auto p-4">
      <div
        style={{ animationDuration: "500ms" }}
        className="motion-safe:animate-revealBottom"
      >
        <h1 className="title text-2xl font-semibold sm:text-xl">
          Meghívók küldése
        </h1>
        <p className="mt-6 text-gray-700 sm:text-sm">
          Add meg a meghívók <b>email címét</b> és <b>szerepkörét</b>. A projekt
          létrehozásakor hozzáférést kapnak a kiválasztott jogosultsági körrel.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-2">
            {memberInvites && memberInvites.length > 0 && (
              <div
                style={{ animationDuration: "500ms" }}
                className="motion-safe:animate-revealBottom flex items-center text-sm text-muted-foreground"
              >
                <span className="flex-grow">Email cím</span>
                <span className="w-[134px] sm:w-[204px]">Szerepkör</span>
              </div>
            )}
            {memberInvites?.map((invite, index) => (
              <MemberInviteInput
                key={index}
                id={index + 1}
                email={invite.email}
                role={invite.role}
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
          <div className="mt-8 flex justify-between border-t pt-8">
            <Button
              disabled={loading}
              type="button"
              onClick={() => router.push("/uj-projekt/1")}
              variant={"outline"}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">Vissza</span>
            </Button>

            <Button
              className="disabled:bg-gray-200 disabled:text-gray-500"
              type="submit"
              isLoading={loading}
            >
              {loading ? "Létrehozás alatt..." : "Létrehozás"}
              {!loading && <Rocket className="ml-2 size-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
