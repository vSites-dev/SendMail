"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, MoreVertical, Power, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Template } from "@prisma/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { atom } from "jotai";
import { toast } from "sonner";
import { BlockModal, EmailBlock } from "./email-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

// Create a new atom for storing email blocks in the global store
export const emailBlocksAtom = atom<EmailBlock[]>([]);

export function CampaignFlow({ templates }: { templates: Template[] }) {
  // Use the global atom for storing email blocks
  const [emailBlocks, setEmailBlocks] = useAtom(emailBlocksAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<EmailBlock | undefined>(undefined);

  useEffect(() => {
    // Initialize with sample data if needed
    if (emailBlocks.length === 0 && templates.length > 0) {
      // Optional: Initialize with empty blocks or leave empty
    }
  }, [emailBlocks.length, templates.length]);

  const handleAddEmail = () => {
    if (templates.length === 0) {
      toast.error("Először hozz létre egy sablont!");
      return;
    }

    setEditingBlock(undefined);
    setIsModalOpen(true);
  };

  const handleEditEmail = (block: EmailBlock) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const handleDeleteEmail = (blockId: string) => {
    setEmailBlocks(emailBlocks.filter((block) => block.id !== blockId));
    toast.success("Email törölve");
  };

  const handleSaveEmail = (data: EmailBlock) => {
    // If we're editing an existing block, replace it
    if (editingBlock) {
      setEmailBlocks(
        emailBlocks.map((block) => (block.id === data.id ? data : block))
      );
      toast.success("Email frissítve");
    } else {
      // Otherwise add a new block
      setEmailBlocks([...emailBlocks, data]);
      toast.success("Email hozzáadva");
    }
  };

  const formatSchedule = (block: EmailBlock) => {
    if (!block.scheduledDate) return "Nincs időzítve";

    const dateString = format(block.scheduledDate, "yyyy. MMMM d.");
    return `${dateString}, ${block.scheduledTime || "00:00:00"}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-sm border rounded-md px-3 py-2 flex items-center gap-3">
        <Power className="size-4 text-indigo-600" strokeWidth={3} />
        Kampány kezdete
      </div>

      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-0.5 bg-border" />
        </div>

        {emailBlocks.map((block) => (
          <div
            key={block.id}
            className="relative z-10 mb-8 w-full max-w-2xl"
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center border-b p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium">
                    {block.subject}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatSchedule(block)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmail(block)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Szerkesztés</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmail(block.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Törlés</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <div className="text-sm font-medium">Tárgy:</div>
                  <div className="text-sm">{block.subject}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Sablon:</div>
                  <div className="text-sm text-muted-foreground">
                    {block.template.name}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}

        <Button
          variant="outline"
          className="relative z-10 mt-4 flex items-center gap-2"
          onClick={handleAddEmail}
        >
          <Plus className="h-4 w-4" />
          Új email hozzáadása
        </Button>
      </div>

      {isModalOpen && (
        <BlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          templates={templates}
          onSave={handleSaveEmail}
          initialData={editingBlock}
        />
      )}
    </div>
  );
}
