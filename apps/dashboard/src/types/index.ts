import { Template } from "@prisma/client";

export type EmailBlock = {
  id: string;
  template: Template;
  subject: string;
  from: string;
  date: Date;
};

export enum MemberRole {
  owner = "owner",
  admin = "admin",
  member = "member",
}

export type MemberInvite = {
  email: string;
  role: MemberRole;
};

export interface InvitationData {
  id: string;
  organization: {
    id: string;
    name: string;
    logo?: string | null;
  };
  email: string;
  role: string | null;
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

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
