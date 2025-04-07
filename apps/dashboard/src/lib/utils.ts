import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "-");

export const contactStatuses = {
  SUBSCRIBED: {
    label: "Feliratkozva",
    bgColor: "bg-green-500",
  },
  UNSUBSCRIBED: {
    label: "Leiratkozva",
    bgColor: "bg-gray-500",
  },
  BOUNCED: {
    label: "Visszapattant",
    bgColor: "bg-red-500",
  },
  COMPLAINED: {
    label: "Reklamált",
    bgColor: "bg-yellow-500",
  },
};

export const domainStatuses = {
  PENDING: {
    label: "Ellenőrzés folyamatban",
    bgColor: "bg-orange-500",
    color: "text-orange-500",
    borderColor: "border-orange-500",
  },
  VERIFIED: {
    label: "Ellenőrzés sikeres",
    bgColor: "bg-green-500",
    color: "text-green-500",
    borderColor: "border-green-500",
  },
  FAILED: {
    label: "Hiba ellenőrzés alatt",
    bgColor: "bg-red-500",
    color: "text-red-500",
    borderColor: "border-red-500",
  },
  DKIM_PENDING: {
    label: "DKIM ellenőrzés folyamatban",
    bgColor: "bg-orange-500",
    color: "text-orange-500",
    borderColor: "border-orange-500",
  },
  DKIM_VERIFIED: {
    label: "DKIM ellenőrzés sikeres",
    bgColor: "bg-green-500",
    color: "text-green-500",
    borderColor: "border-green-500",
  },
  DKIM_FAILED: {
    label: "DKIM ellenőrzés hiba",
    bgColor: "bg-red-500",
    color: "text-red-500",
    borderColor: "border-red-500",
  },
};
