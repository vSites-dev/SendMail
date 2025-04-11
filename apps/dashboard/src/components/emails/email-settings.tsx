"use client";

import { Template } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TemplateCard } from "@/components/ui/template-card";
import { useAtom } from "jotai";
import { useState } from "react";
import {
  emailSubjectAtom,
  emailTemplateIdAtom,
  emailFromAtom,
  emailDateAtom,
} from "@/store/global";
import { Alert } from "../ui/alert";
import { AlertCard } from "../ui/texture-alert";

interface EmailSettingsProps {
  templates: Template[];
  domains: string[];
  settings: {
    subject: string;
    templateId: string;
    from: string;
    date: Date;
  };
  onChange: (settings: {
    subject: string;
    templateId: string;
    from: string;
    date: Date;
  }) => void;
}

export function EmailSettings({
  templates,
  domains,
  settings,
  onChange,
}: EmailSettingsProps) {
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      onChange({ ...settings, date: newDate });
    }
  };

  const [senderName, setSenderName] = useState(
    settings.from.split("@")[0] || "",
  );
  const [selectedDomain, setSelectedDomain] = useState(
    settings.from.split("@")[1] || "",
  );

  const selectedTemplate = templates.find((t) => t.id === settings.templateId);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <Label htmlFor="sender-email" className="text-base font-medium">
          Küldő email címe
        </Label>
        <div className="flex w-full items-center gap-0">
          <div className="relative flex-1">
            <Input
              id="sender-name"
              value={senderName}
              onChange={(e) => {
                setSenderName(e.target.value);
                onChange({
                  ...settings,
                  from: `${e.target.value}@${selectedDomain}`,
                });
              }}
              placeholder="Küldő név"
              className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 !shadow-none !drop-shadow-none pr-6"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
              <span className="text-muted-foreground">@</span>
            </div>
          </div>
          <Select
            value={selectedDomain}
            onValueChange={(value) => {
              setSelectedDomain(value);
              onChange({ ...settings, from: `${senderName}@${value}` });
            }}
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
          value={settings.subject}
          onChange={(e) => onChange({ ...settings, subject: e.target.value })}
          placeholder="Írja be az email tárgyát"
          className="w-full focus-visible:ring-0 focus-visible:ring-offset-0 !shadow-none !drop-shadow-none"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-base font-medium">Válasszon sablont</Label>

        <RadioGroup
          value={settings.templateId}
          onValueChange={(value) =>
            onChange({ ...settings, templateId: value })
          }
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
                  !settings.date && "text-muted-foreground",
                )}
              >
                {settings.date ? (
                  settings.date.toLocaleString()
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
                  selected={settings.date}
                  onSelect={handleDateSelect}
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

                    const currentHours = settings.date?.getHours() || 0;
                    const currentMinutes = settings.date?.getMinutes() || 0;
                    const isSelected =
                      settings.date &&
                      currentHours === hours &&
                      (currentMinutes >= 0 && currentMinutes < 30
                        ? minutes === 0
                        : minutes === 30);

                    return (
                      <Button
                        key={timeString}
                        type="button"
                        variant={"ghost"}
                        className={cn(
                          "w-full justify-start h-10",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                        onClick={() => {
                          if (settings.date) {
                            const newDate = new Date(settings.date);
                            newDate.setHours(hours, minutes, 0);
                            onChange({ ...settings, date: newDate });
                          } else {
                            const newDate = new Date();
                            newDate.setHours(hours, minutes, 0);
                            onChange({ ...settings, date: newDate });
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

      <AlertCard variant="info">
        <div className="flex items-center gap-2">
          <p className="text-sm">
            <b>Több email</b> egyszeri küldéséhez, hozz létre kampányt.
          </p>
        </div>
      </AlertCard>
    </div>
  );
}
