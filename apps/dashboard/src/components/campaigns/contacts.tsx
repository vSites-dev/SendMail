"use client";

import { useState } from "react";
import { Contact } from "@prisma/client";
import { motion } from "framer-motion";
import { Check, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function CampaignContacts({ contacts }: { contacts: Contact[] }) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Kontaktok kiválasztása
        </h2>
        <div className="text-sm text-muted-foreground">
          {selectedContacts.length} / {contacts.length} kiválasztva
        </div>
      </div>

      <div className="rounded-lg border">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nincsenek kontaktok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Még nincsenek kontaktjaid. Adj hozzá néhányat a kezdéshez.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {contacts.map((contact, index) => {
              const isSelected = selectedContacts.includes(contact.id);
              return (
                <motion.li
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "cursor-pointer transition-all duration-200 ease-in-out",
                  )}
                  onClick={() => toggleContact(contact.id)}
                >
                  <div className="flex items-center px-4 py-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                        isSelected
                          ? "border-violet-600 bg-violet-100 text-violet-600 dark:bg-violet-900/20"
                          : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800",
                      )}
                    >
                      {contact.name ? (
                        <span className="text-sm font-medium">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </span>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {contact.name || "Névtelen kontakt"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.email}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-md border",
                              isSelected
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-slate-300 dark:border-slate-600",
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
