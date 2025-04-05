"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, CalendarIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EmailBlock } from "@/types";

export function BlockModal({
  isOpen,
  onClose,
  templates,
  onSave,
  domains,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSave: (data: EmailBlock) => void;
  domains: string[];
  initialData?: EmailBlock;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [subject, setSubject] = useState(initialData?.subject || "");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    initialData?.template || null,
  );
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date || undefined,
  );

  const [id] = useState(initialData?.id || `email-${Date.now()}`);
  const [senderName, setSenderName] = useState(initialData?.from?.split("@")[0] || "");
  const [selectedDomain, setSelectedDomain] = useState(initialData?.from?.split("@")[1] || "");

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
    if (!date) return;

    onSave({
      id,
      template: selectedTemplate,
      subject,
      from: `${senderName}@${selectedDomain}`,
      date: date,
    });

    onClose();
  };

  const isValid = subject.trim() !== "" && selectedTemplate !== null && date !== undefined && senderName.trim() !== "" && selectedDomain !== "" && domains.includes(selectedDomain);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        className="relative max-h-[90vh] w-full max-w-xl flex flex-col overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-300"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Email blokk szerkesztése" : "Új email blokk hozzáadása"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Bezárás</span>
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          <div className="space-y-1">
            <Label htmlFor="sender-email" className="text-base font-medium">
              Küldő email címe
            </Label>
            <div className="flex w-full items-center gap-0">
              <div className="relative flex-1">
                <Input
                  id="sender-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Küldő név"
                  className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 !shadow-none !drop-shadow-none pr-6"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                  <span className="text-muted-foreground">@</span>
                </div>
              </div>
              <Select
                value={selectedDomain}
                onValueChange={setSelectedDomain}
              >
                <SelectTrigger className="w-[180px] rounded-l-none border-l-0 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Domain választás" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="subject" className="text-base font-medium">
              Email tárgya
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Írja be az email tárgyát"
              className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 !shadow-none !drop-shadow-none"
            />
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
            <Label className="text-base font-medium">Időzítés</Label>
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
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
                className="w-[420px] p-0 rounded-md border"
                align="start"
              >
                <div className="flex">
                  <div className="border-r w-[280px]">
                    <Calendar
                      mode="single"
                      className="p-2"
                      selected={date}
                      onSelect={setDate}
                    />
                  </div>
                  <div className="w-[140px]">
                    <div className="p-2 border-b">
                      <Label className="text-xs font-medium">Időpont</Label>
                    </div>
                    <ScrollArea className="h-[230px] p-2">
                      {Array.from({ length: 48 }).map((_, index) => {
                        const hours = Math.floor(index / 2);
                        const minutes = index % 2 === 0 ? 0 : 30;
                        const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

                        const currentHours = date?.getHours() || 0;
                        const currentMinutes = date?.getMinutes() || 0;
                        const isSelected =
                          date &&
                          currentHours === hours &&
                          (currentMinutes >= 0 && currentMinutes < 30 ? minutes === 0 : minutes === 30);

                        return (
                          <Button
                            key={timeString}
                            type="button"
                            variant={"ghost"}
                            className={cn(
                              "w-full justify-start h-10",
                              isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                            )}
                            onClick={() => {
                              if (date) {
                                const newDate = new Date(date);
                                newDate.setHours(hours, minutes, 0);
                                setDate(newDate);
                              } else {
                                const newDate = new Date();
                                newDate.setHours(hours, minutes, 0);
                                setDate(newDate);
                              }
                            }}
                          >
                            {timeString}
                          </Button>
                        );
                      })}
                    </ScrollArea>
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
