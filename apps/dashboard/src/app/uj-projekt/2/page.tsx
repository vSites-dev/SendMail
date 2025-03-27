"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { onboardingMemberInvitesAtom } from "@/store/global";
import { MemberRole } from "@/types";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Rocket, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip";

const MemberInviteInput = ({
  id,
  email,
  role,
}: {
  id: number;
  email: string;
  role: MemberRole;
}) => {
  const [memberInvites, setMemberInvites] = useAtom(
    onboardingMemberInvitesAtom,
  );

  const handleEmailChange = (email: string) => {
    setMemberInvites((prev) => {
      const newInvites = [...prev];
      newInvites[id - 1]!.email = email;
      return newInvites;
    });
  };

  const handleRoleChange = (role: MemberRole) => {
    setMemberInvites((prev) => {
      const newInvites = [...prev];
      newInvites[id - 1]!.role = role;
      return newInvites;
    });
  };

  const handleRemove = () => {
    setMemberInvites((prev) => {
      const newInvites = [...prev];
      newInvites.splice(id - 1, 1);
      return newInvites;
    });
  };

  return (
    <div
      style={{ animationDuration: "500ms" }}
      className="motion-safe:animate-revealBottom flex items-center space-x-2"
    >
      <div className="flex-grow">
        <Input
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          placeholder={`${id}. Email cím`}
          className="w-full"
        />
      </div>
      <div className="w-[180px]">
        <Select
          value={role}
          onValueChange={(value) => handleRoleChange(value as MemberRole)}
        >
          <SelectTrigger>
            <SelectValue placeholder={`${id}. Szerepkör`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MemberRole.OWNER}>Tulajdonos</SelectItem>
            <SelectItem value={MemberRole.ADMIN}>Adminisztrátor</SelectItem>
            <SelectItem value={MemberRole.MARKETING}>Marketinges</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipContent>
            Törlés
          </TooltipContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRemove}
              className="hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function OnboardingStepTwo() {
  const router = useRouter();

  const [memberInvites, setMemberInvites] = useAtom(
    onboardingMemberInvitesAtom,
  );
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (
      memberInvites.length > 0 &&
      memberInvites.every((invite) => invite.email && invite.role)
    ) {
      toast.success("nice");
    } else {
      setLoading(false);
      toast.error(
        "Minden meghívottnak szükséges megadni az email címét és szerepkörét!",
      );
      return;
    }
  };

  const handleAddMember = () => {
    setMemberInvites((prev) => [
      ...prev,
      { email: "", role: MemberRole.MARKETING },
    ]);
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
            {memberInvites.length > 0 && (
              <div
                style={{ animationDuration: "500ms" }}
                className="motion-safe:animate-revealBottom flex items-center text-sm text-muted-foreground">
                <span className="flex-grow">Email cím</span>
                <span className="w-[134px] sm:w-[204px]">Szerepkör</span>
              </div>
            )}
            {memberInvites.map((invite, index) => (
              <MemberInviteInput
                key={index}
                id={index + 1}
                email={invite.email}
                role={invite.role}
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
