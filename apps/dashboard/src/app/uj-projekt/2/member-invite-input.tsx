"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtom } from "jotai";
import { MemberRole } from "@/types";
import { onboardingMemberInvitesAtom } from "@/store/global";
import { Trash2 } from "lucide-react";
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
            <SelectItem value={MemberRole.owner}>Tulajdonos</SelectItem>
            <SelectItem value={MemberRole.admin}>Adminisztrátor</SelectItem>
            <SelectItem value={MemberRole.member}>Marketinges</SelectItem>
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

export default MemberInviteInput;