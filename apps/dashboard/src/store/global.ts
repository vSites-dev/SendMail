"use client";

import type { Organization } from "@/lib/auth/auth";
import { GetForTableEmail } from "@/server/api/routers/emails";
import { EmailBlock, MemberInvite } from "@/types";
import { Campaign, Contact, Domain, Email, Project } from "@prisma/client";
import { atom, createStore } from "jotai";

export const globalStore = createStore();

export const activeOrganizationAtom = atom<Organization | null>(null);
export const activeProjectAtom = atom<Project | null>(null);

export const selectedIntervalAtom = atom<7 | 30 | 90 | 180 | 365>(30);

export const contactDataTableAtom = atom<Contact[]>([]);
export const domainDataTableAtom = atom<Domain[]>([]);
export const emailDataTableAtom = atom<GetForTableEmail[]>([]);
export const campaignDataTableAtom = atom<Campaign[]>([]);

// Campaign creation atoms
export const selectedCampaignContactsAtom = atom<string[]>([]);
export const campaignContactsDataTableAtom = atom<Contact[]>([]);
export const campaignEmailBlocksAtom = atom<EmailBlock[]>([]);
export const campaignNameAtom = atom<string>("");

// Onboarding atoms
export const onboardingMemberInvitesAtom = atom<MemberInvite[] | null>(null);
export const onboardingProjectNameAtom = atom<string>("");
export const onboardingUploadedFileUrlAtom = atom<string | null>(null);
