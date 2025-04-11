"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Cog,
  Eye,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Contact, Template } from "@prisma/client";
import { useAtom } from "jotai";
import { selectedEmailContactsAtom } from "@/store/global";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { EmailContacts } from "./email-contacts";
import { EmailSettings } from "./email-settings";

export type Step = {
  id: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  Icon: React.ReactNode;
};

export function SendEmailModal({
  isOpen,
  onClose,
  contacts,
  templates,
  domains,
}: {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  templates: Template[];
  domains: string[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const utils = api.useUtils();

  const [selectedContacts, setSelectedContacts] = useAtom(
    selectedEmailContactsAtom,
  );

  const [emailSettings, setEmailSettings] = useState({
    subject: "",
    templateId: "",
    from: "",
    date: new Date(),
  });

  const steps: Step[] = [
    {
      id: 1,
      title: "Kontaktok",
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
      Icon: <Users />,
    },
    {
      id: 2,
      title: "Beállítások",
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
      Icon: <Cog />,
    },
  ];

  useEffect(() => {
    setIsMounted(true);

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const { mutateAsync: sendEmail, isPending } = api.email.send.useMutation();

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        if (!emailSettings.templateId || !emailSettings.from) {
          toast.error("Kérjük, válassz ki egy sablont és egy küldő címet!");
          return;
        }

        const selectedTemplate = templates.find(
          (t) => t.id === emailSettings.templateId,
        );
        if (!selectedTemplate) {
          toast.error("Nem található a kiválasztott sablon!");
          return;
        }

        const res = await sendEmail({
          subject: emailSettings.subject,
          body: selectedTemplate.body,
          contactIds: selectedContacts,
          from: emailSettings.from,
        });

        if (res.success) {
          toast.success("Az email sikeresen elküldve!");
        } else {
          toast.error(res.error);
        }

        utils.email.invalidate();
        onClose();
      } catch (error) {
        console.error("Error sending email:", error);
        toast.error("Valami hiba történt az email küldése során.");
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isMounted || !isOpen) return null;

  function isButtonDisabled() {
    if (currentStep === 1) {
      return selectedContacts.length === 0;
    }

    if (currentStep === 2) {
      return !emailSettings.templateId || !emailSettings.from;
    }

    return false;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        ref={modalRef}
        className="relative min-h-[400px] min-w-[400px] flex h-[calc(100vh-30px)] w-[calc(100vw-30px)] flex-col overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-300"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center border-b p-4">
          <div className="flex items-center gap-2 absolute left-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Bezárás</span>
            </Button>
            <Badge className="text-muted-foreground" variant="outline">
              ESC
            </Badge>
          </div>
          <div className="mx-auto flex items-center">
            <h2 id="modal-title" className="text-xl font-semibold">
              Email küldése
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-center border-b p-4">
          <div className="flex items-center gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${step.isActive
                    ? "text-primary"
                    : step.isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${step.isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : step.isCompleted
                        ? "border-primary text-primary"
                        : "border-muted-foreground/50 text-muted-foreground/50"
                    }`}
                >
                  {step.Icon}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
                {step.id < steps.length && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {currentStep === 1 && <EmailContacts contacts={contacts} />}
          {currentStep === 2 && (
            <EmailSettings
              templates={templates}
              domains={domains}
              settings={emailSettings}
              onChange={setEmailSettings}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t p-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Előző
          </Button>

          <div className="text-xs text-muted-foreground flex items-center gap-2">
            Az email el lesz küldve
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="bg-violet-50 border-violet-500 border text-violet-500 font-semibold tracking-wide rounded-full px-2 py-1 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedContacts.length} kontaktnak
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-h-[200px] overflow-y-auto p-2">
                  <div className="space-y-1">
                    {contacts
                      .filter((contact) =>
                        selectedContacts.includes(contact.id),
                      )
                      .map((contact) => (
                        <div key={contact.id} className="text-sm border-b">
                          {contact.name || contact.email}
                        </div>
                      ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            onClick={handleNext}
            disabled={isButtonDisabled() || isPending}
            isLoading={isPending}
          >
            {currentStep === steps.length ? "Küldés" : "Következő"}
            {!isPending && (
              <>
                {currentStep === steps.length && <Check className="h-4 w-4" />}
                {currentStep < steps.length && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
