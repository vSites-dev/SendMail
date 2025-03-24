"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, CalendarIcon, ClockIcon, FolderClosed } from "lucide-react";
import { format } from "date-fns";
import { Template } from "@prisma/client";
import { TemplateCard } from "@/components/ui/template-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmailBlock } from "@/types";

export function BlockModal({
  isOpen,
  onClose,
  templates,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSave: (data: EmailBlock) => void;
  initialData?: EmailBlock;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialData?.template || null,
  );
  const [date, setDate] = useState<Date | undefined>(
    initialData?.scheduledDate || undefined,
  );

  const [id] = useState(initialData?.id || `email-${Date.now()}`);

  useEffect(() => {
    setIsMounted(true);

    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeys);

    return () => {
      window.removeEventListener("keydown", handleKeys);
    };
  }, [onClose]);

  const handleSave = () => {
    if (!selectedTemplate || !subject.trim()) return;

    onSave({
      id,
      template: selectedTemplate,
      subject,
      scheduledDate: date,
    });

    onClose();
  };

  const isValid = subject.trim() !== "" && selectedTemplate !== null;

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        className="relative max-h-[90vh] w-[90vw] max-w-3xl flex flex-col overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-300"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {initialData ? "Email szerkesztése" : "Új email hozzáadása"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Bezárás</span>
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-base font-medium">
              Email tárgya
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Írja be az email tárgyát"
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Válasszon sablont</Label>

            <RadioGroup
              value={selectedTemplate?.id}
              onValueChange={(value) => {
                const template = templates.find((t) => t.id === value);
                if (template) setSelectedTemplate(template);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {templates.map((template) => (
                <div key={template.id} className="relative">
                  <RadioGroupItem
                    value={template.id}
                    id={`template-${template.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`template-${template.id}`}
                    className={cn(
                      "block cursor-pointer rounded-lg",
                      "peer-focus:ring-[2px] peer-focus:ring-offset-2 peer-focus:ring-black/50",
                    )}
                  >
                    <TemplateCard
                      title={template.name}
                      description={template.updatedAt.toLocaleString()}
                      selected={selectedTemplate?.id === template.id}
                    />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-medium">Időzítés</Label>
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    {date ? (
                      date.toLocaleString()
                    ) : (
                      <span>Válassz ki egy időpontot</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-md border"
                align="start"
              >
                <Calendar
                  mode="single"
                  className="p-2"
                  selected={date}
                  onSelect={setDate}
                />
                <div className="border-t p-3">
                  <div className="flex items-center gap-3">
                    <Label className="text-xs">Időpont:</Label>
                    <div className="relative grow">
                      <Input
                        type="time"
                        step="1"
                        value={date && `${date?.getHours()}:${date?.getMinutes()}:${date?.getSeconds()}`}
                        onChange={(e) =>
                          date ?
                            setDate(
                              new Date(
                                date.setHours(
                                  Number(e.target.value.split(":")[0] ?? 12),
                                  Number(e.target.value.split(":")[1] ?? 0),
                                  Number(e.target.value.split(":")[2] ?? 0),
                                ),
                              ),
                            ) : setDate(new Date())
                        }
                        className="peer appearance-none ps-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <ClockIcon size={16} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center justify-end border-t p-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            Mégsem
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {initialData ? "Mentés" : "Hozzáadás"}
          </Button>
        </div>
      </Card>
    </div>,
    document.body,
  );
}
