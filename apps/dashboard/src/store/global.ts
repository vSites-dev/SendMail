"use client";

import type { Organization } from "@/lib/auth/auth";
import { GetForTableCampaignType } from "@/server/api/routers/campaigns";
import { GetForTableEmail } from "@/server/api/routers/emails";
import { EmailBlock, MemberInvite } from "@/types";
import { Contact, Domain, Project } from "@prisma/client";
import { atom, createStore } from "jotai";

export const globalStore = createStore();

export const activeOrganizationAtom = atom<Organization | null>(null);
export const activeProjectAtom = atom<Project | null>(null);

export const selectedIntervalAtom = atom<7 | 30 | 90 | 180 | 365>(30);

export const contactDataTableAtom = atom<Contact[]>([]);
export const domainDataTableAtom = atom<Domain[]>([]);
export const emailDataTableAtom = atom<GetForTableEmail[]>([]);
export const campaignDataTableAtom = atom<GetForTableCampaignType[]>([]);

// Campaign creation atoms
export const selectedCampaignContactsAtom = atom<string[]>([]);
export const campaignContactsDataTableAtom = atom<Contact[]>([]);
export const campaignEmailBlocksAtom = atom<EmailBlock[]>([]);
export const campaignNameAtom = atom<string>("");

// Email sending atoms
export const selectedEmailContactsAtom = atom<string[]>([]);
export const emailContactsDataTableAtom = atom<Contact[]>([]);
export const emailSubjectAtom = atom<string>("");
export const emailTemplateIdAtom = atom<string>("");
export const emailFromAtom = atom<string>("");
export const emailDateAtom = atom<Date>(new Date());

// Onboarding atoms
export const onboardingMemberInvitesAtom = atom<MemberInvite[] | null>(null);
export const onboardingProjectNameAtom = atom<string>("");
export const onboardingUploadedFileUrlAtom = atom<string | null>(null);
