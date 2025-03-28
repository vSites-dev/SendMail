"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Blocks,
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
import { CampaignSteps } from "@/components/campaigns/steps";
import { CampaignContacts } from "@/components/campaigns/contacts";
import { CampaignSettings } from "@/components/campaigns/settings";
import { CampaignOverview } from "@/components/campaigns/overview";
import { CampaignFlow } from "@/components/campaigns/flow";
import { Contact, Template } from "@prisma/client";
import { useAtom } from "jotai";
import { campaignEmailBlocksAtom, campaignNameAtom, selectedCampaignContactsAtom } from "@/store/global";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Badge } from "../ui/badge";


export type Step = {
  id: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  Icon: React.ReactNode;
};

export function CampaignModal({
  isOpen,
  onClose,
  contacts,
  templates,
}: {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  templates: Template[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [name, setName] = useAtom(campaignNameAtom);
  const [selectedContacts, setSelectedContacts] = useAtom(
    selectedCampaignContactsAtom
  );
  const [emailBlocks, setEmailBlocks] = useAtom(campaignEmailBlocksAtom);

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
      title: "Lépések",
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
      Icon: <Blocks />,
    },
    {
      id: 3,
      title: "Beállítások",
      isActive: currentStep === 3,
      isCompleted: currentStep > 3,
      Icon: <Cog />,
    },
    {
      id: 4,
      title: "Áttekintés",
      isActive: currentStep === 4,
      isCompleted: currentStep > 4,
      Icon: <Eye />,
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

  const { mutateAsync: createCampaign, isPending } = api.campaign.createWithTask.useMutation();

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        console.log("Campaign submitted for processing!");

        const campaignName = `Campaign ${new Date().toLocaleDateString()}`;
        const firstEmailBlock = emailBlocks[0];

        if (!firstEmailBlock) {
          toast.error('Legalább egy email blokkra van szükgség a kampány létrehozásához');
          return;
        }

        const res = await createCampaign({
          name: campaignName,
          contactIds: selectedContacts,
          emailBlocks: emailBlocks.map(block => ({
            subject: block.subject,
            templateId: block.template.id,
            scheduledDate: block.scheduledDate,
            scheduledTime: block.scheduledTime
          }))
        });

        if (res.success) {
          toast.success("A kampány sikeresen létrehozva!");
        } else {
          toast.error(res.error);

          setCurrentStep(1);
          setSelectedContacts([]);
          setEmailBlocks([]);
        }

        onClose();
      } catch (error) {
        console.error('Error creating campaign:', error);
        toast.error('Failed to create campaign. Please try again.');
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
      return emailBlocks.length === 0;
    }

    if (currentStep === 3) {
      // Check if settings exist and name is at least 3 characters long
      return !name;
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Bezárás</span>
            </Button>
            <Badge className="text-muted-foreground" variant="outline">ESC</Badge>
          </div>
          <div className="mx-auto flex items-center">
            <h2 id="modal-title" className="text-xl font-semibold">
              Kampány létrehozása
            </h2>
          </div>
        </div>

        <CampaignSteps steps={steps} />

        <div className="flex-1 overflow-auto p-6">
          {currentStep === 1 && <CampaignContacts contacts={contacts} />}
          {currentStep === 2 && <CampaignFlow templates={templates} />}
          {currentStep === 3 && <CampaignSettings />}
          {currentStep === 4 && <CampaignOverview />}
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
            A kampány el lesz küldve <div className="bg-violet-50 border-violet-500 border text-violet-500 font-semibold tracking-wide rounded-full px-2 py-1 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {selectedContacts.length} kontaktnak</div>
          </div>
          <Button onClick={handleNext} disabled={isButtonDisabled()} isLoading={isPending}>
            {currentStep === steps.length ? "Befejezés" : "Következő"}
            {!isPending && (
              <>
                {currentStep === steps.length && <Check className="h-4 w-4" />}
                {currentStep < steps.length && <ChevronRight className="h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
