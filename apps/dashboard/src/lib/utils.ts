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
    label: "Visszapattant????",
    color: "bg-red-500",
  },
  COMPLAINED: {
    label: "Fellebezzett??",
    color: "bg-yellow-500",
  },
};
