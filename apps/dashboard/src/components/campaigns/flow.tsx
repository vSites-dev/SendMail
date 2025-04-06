"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  MoreVertical,
  Power,
  Edit,
  Trash2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Template } from "@prisma/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { BlockModal } from "./email-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useAtom } from "jotai";
import { campaignEmailBlocksAtom } from "@/store/global";
import { EmailBlock } from "@/types";
import { api } from "@/trpc/react";
import MarkdownIt from "markdown-it";

export function CampaignFlow({ templates }: { templates: Template[] }) {
  const [emailBlocks, setEmailBlocks] = useAtom(campaignEmailBlocksAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<EmailBlock | undefined>(
    undefined,
  );

  const { data: domains } = api.domain.getAll.useQuery();

  const handleAddEmail = () => {
    if (templates.length === 0) {
      toast.error("Először hozz létre egy sablont!");
      return;
    }
    if (
      !domains ||
      domains.length === 0 ||
      !domains.some((domain) => domain.status === "VERIFIED")
    ) {
      toast.error("Először hozz létre egy domain!");
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
    toast.success(`Email blokk törölve`);
  };

  const handleSaveEmail = (data: EmailBlock) => {
    if (editingBlock) {
      setEmailBlocks(
        emailBlocks.map((block) => (block.id === data.id ? data : block)),
      );
      toast.success("Email blokk frissítve");
    } else {
      setEmailBlocks([...emailBlocks, data]);
      toast.success("Email blokk létrehozva");
    }
  };

  const formatSchedule = (block: EmailBlock) => {
    if (!block.date) return "Nincs időzítve";

    const dateString = format(block.date, "yyyy. MMMM d.");
    return `${dateString}, ${block.date.toTimeString().slice(0, 5)}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center w-full">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-[1px] bg-border" />
        </div>

        <div className="bg-white text-sm border font-medium rounded-md px-3 py-2 flex items-center gap-3 relative z-10 mb-8">
          <Wand2 className="size-5 text-violet-600" />
          Kampány kezdete
        </div>

        {emailBlocks.map((block, index) => (
          <div key={block.id} className="relative z-10 mb-8 w-max">
            <Card className="overflow-hidden rounded-sm">
              <div className="flex items-center justify-between border-b p-4 gap-14">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center text-violet-600 border rounded-full text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs text-muted-foreground">{index + 1}. email</p>
                    <div className="text-sm font-medium">
                      {formatSchedule(block)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmail(block)}
                          className="hover:text-violet-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Szerkesztés</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmail(block.id)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
                <div className="text-sm mb-1">
                  <span className="text-muted-foreground mr-2">Küldő:</span>
                  <span className="text-sm font-medium">{block.from}</span>
                </div>
                <div className="mb-2 pb-2 text-sm border-b">
                  <span className="text-muted-foreground mr-2">Tárgy:</span>
                  <span className="text-sm font-medium">{block.subject}</span>
                </div>
                <div className="mb-2 pb-2 text-sm border-b">
                  <span className="text-muted-foreground mr-2">Sablon:</span>
                  <span className="text-sm font-medium">
                    {block.template.name}
                  </span>
                </div>
                <div className="text-sm max-w-[400px] prose prose-sm">
                  {(() => {
                    const md = new MarkdownIt({
                      html: true,
                      breaks: true,
                      linkify: true,
                    });

                    const contentLines = block.template.body.split('\n').filter(line => line.trim().length > 0);
                    const previewLines = contentLines.slice(0, 3);
                    const hasMore = contentLines.length > 3;

                    const previewContent = previewLines.join('\n');
                    const htmlContent = md.render(previewContent);

                    return (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        {hasMore && <div className="mt-1 text-lg font-bold">...</div>}
                      </>
                    );
                  })()}
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
          domains={domains?.map((d) => d.name) ?? []}
          initialData={editingBlock}
        />
      )}
    </div>
  );
}
