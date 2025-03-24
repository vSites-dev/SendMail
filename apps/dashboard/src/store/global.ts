"use client";

import type { Organization } from "@/lib/auth/auth";
import { CampaignSettings, EmailBlock } from "@/types";
import { Contact, Domain, Email, Project } from "@prisma/client";
import { atom, createStore } from "jotai";

export const globalStore = createStore();

export const activeOrganizationAtom = atom<Organization | null>(null);
export const activeProjectAtom = atom<Project | null>(null);

export const selectedIntervalAtom = atom<7 | 30 | 90 | 180 | 365>(30);

export const contactDataTableAtom = atom<Contact[]>([]);
export const domainDataTableAtom = atom<Domain[]>([]);
export const emailDataTableAtom = atom<Email[]>([]);

// Campaign creation atoms
export const selectedCampaignContactsAtom = atom<string[]>([]);
export const campaignContactsDataTableAtom = atom<Contact[]>([]);
export const campaignEmailBlocksAtom = atom<EmailBlock[]>([]);
export const campaignSettingsAtom = atom<CampaignSettings>();
