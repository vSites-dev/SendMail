import { Template } from "@prisma/client";

export type EmailBlock = {
  id: string;
  template: Template;
  subject: string;
  scheduledDate?: Date;
  scheduledTime?: string;
};

export enum MemberRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MARKETING = "MARKETING",
}

export type MemberInvite = {
  email: string;
  role: MemberRole;
};
