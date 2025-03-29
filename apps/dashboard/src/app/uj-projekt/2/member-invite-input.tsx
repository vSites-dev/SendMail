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
import { useAtom } from "jotai";
import { MemberRole } from "@/types";
import { onboardingMemberInvitesAtom } from "@/store/global";
import { Trash2 } from "lucide-react";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MemberInviteInput = ({
  id,
  email,
  role,
  onRemove,
  onEmailChange,
  onRoleChange,
  emailDisabled = false,
  roleDisabled = false,
  deleteDisabled = false,
  shouldAnimate = true,
}: {
  id: number;
  email: string;
  role: MemberRole;
  onRemove: () => void;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: MemberRole) => void;
  emailDisabled?: boolean;
  roleDisabled?: boolean;
  deleteDisabled?: boolean;
  shouldAnimate?: boolean;
}) => {
  return (
    <div
      style={{ animationDuration: shouldAnimate ? "500ms" : "0ms" }}
      className={cn(
        shouldAnimate && "motion-safe:animate-revealBottom",
        "flex items-center space-x-2",
      )}
    >
      <div className="flex-grow">
        <Input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={`${id}. Email cím`}
          disabled={emailDisabled || deleteDisabled}
          readOnly={emailDisabled || deleteDisabled}
          className="w-full"
        />
      </div>
      <div className="w-[180px]">
        <Select
          value={role}
          onValueChange={(value) => onRoleChange(value as MemberRole)}
          disabled={roleDisabled || deleteDisabled}
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
          <TooltipContent>Törlés</TooltipContent>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemove}
              disabled={deleteDisabled}
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
