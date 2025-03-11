"use client";

import type { Organization } from "@/lib/auth/auth";
import { Contact, Domain, Project } from "@prisma/client";
import { atom, createStore } from "jotai";

export const globalStore = createStore();

export const activeOrganizationAtom = atom<Organization | null>(null);
export const activeProjectAtom = atom<Project | null>(null);

export const selectedIntervalAtom = atom<7 | 30 | 90 | 180 | 365>(30);

export const contactDataTableAtom = atom<Contact[]>([]);
export const domainDataTableAtom = atom<Domain[]>([]);

// Campaign creation atoms
export const selectedCampaignContactsAtom = atom<string[]>([]);
export const campaignContactsDataTableAtom = atom<Contact[]>([]);
