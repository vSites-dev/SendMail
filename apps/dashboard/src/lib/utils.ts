import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const contactStatuses = {
  SUBSCRIBED: {
    label: "Feliratkozva",
    color: "bg-green-500",
  },
  UNSUBSCRIBED: {
    label: "Leiratkozva",
    color: "bg-gray-500",
  },
  BOUNCED: {
    label: "Nem létező",
    color: "bg-red-500",
  },
  COMPLAINED: {
    label: "Reklamált",
    color: "bg-yellow-500",
  },
};

export const domainStatuses = {
  PENDING: {
    label: "Ellenőrzés folyamatban",
    color: "bg-orange-500",
  },
  VERIFIED: {
    label: "Ellenőrzés sikeres",
    color: "bg-green-500",
  },
  FAILED: {
    label: "Hiba ellenőrzés alatt",
    color: "bg-red-500",
  },
  DKIM_PENDING: {
    label: "DKIM ellenőrzés folyamatban",
    color: "bg-orange-500",
  },
  DKIM_VERIFIED: {
    label: "DKIM ellenőrzés sikeres",
    color: "bg-green-500",
  },
  DKIM_FAILED: {
    label: "DKIM ellenőrzés hiba",
    color: "bg-red-500",
  },
};
