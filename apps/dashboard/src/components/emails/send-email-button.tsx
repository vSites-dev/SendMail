"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SendEmailModal } from "./send-email-modal";
import { SquarePlus } from "lucide-react";
import { Contact, Template } from "@prisma/client";

export default function SendEmailButton({
  contacts,
  templates,
  domains,
}: {
  contacts: Contact[];
  templates: Template[];
  domains: string[];
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <SquarePlus className="size-5" />
        Email küldése
      </Button>

      <SendEmailModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        contacts={contacts}
        templates={templates}
        domains={domains}
      />
    </>
  );
}
