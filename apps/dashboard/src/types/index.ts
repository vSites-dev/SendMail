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

// for emails
export interface VerifyEmailProps {
  email: string;
  name: string;
  verificationUrl: string;
}

export interface ProjectInvitationEmailProps {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
}
