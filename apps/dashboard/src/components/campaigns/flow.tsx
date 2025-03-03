"use client";

import { useState } from "react";
import { Mail, Linkedin, Plus, MoreVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmailTemplate = {
  id: number;
  type: "email" | "other";
  title: string;
  day: number;
  enabled: boolean;
  subject?: string;
  content?: string;
  connectionMessage?: string;
};

export function CampaignFlow() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      type: "email",
      title: "Email",
      day: 1,
      enabled: true,
      subject: "Reaching out",
      content: "yup",
    },
    {
      id: 2,
      type: "email",
      title: "Follow-up Email",
      day: 4,
      enabled: true,
      subject: "Reaching out",
      content: "yup12",
    },
    {
      id: 3,
      type: "email",
      title: "Connect - Automatic",
      day: 10,
      enabled: true,
      connectionMessage: "yup321,",
    },
  ]);

  const handleToggle = (id: number) => {
    setTemplates(
      templates.map((template) =>
        template.id === id
          ? { ...template, enabled: !template.enabled }
          : template,
      ),
    );
  };

  const addTemplate = () => {
    const newId = Math.max(...templates.map((t) => t.id), 0) + 1;
    setTemplates([
      ...templates,
      {
        id: newId,
        type: "email",
        title: "Új Email",
        day:
          templates.length > 0 ? templates[templates.length - 1]!.day + 3 : 1,
        enabled: true,
      },
    ]);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex flex-col items-center">
        <div className="rounded-full bg-primary/10 p-3">
          <div className="rounded-full bg-primary/20 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm font-medium">Kampány kezdete</div>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-0.5 bg-border" />
        </div>

        {templates.map((template, index) => (
          <div
            key={template.id}
            className="relative z-10 mb-8 w-full max-w-2xl"
          >
            <Card className="overflow-hidden">
              <div className="flex items-center border-b p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {template.type === "email" ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium">
                    {template.id}. {template.title}
                  </div>
                  {template.type === "email" && (
                    <div className="text-xs text-muted-foreground">
                      Threaded Follow-up
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">
                      Nap {template.day}
                    </span>
                  </div>
                  <Switch
                    checked={template.enabled}
                    onCheckedChange={() => handleToggle(template.id)}
                  />
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {template.type === "email" ? (
                  <>
                    <div className="mb-2 flex items-center">
                      <div className="text-sm font-medium">Tárgy:</div>
                      <div className="ml-2 text-sm">{template.subject}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {template.content}
                    </div>
                  </>
                ) : template.type === "other" ? (
                  <>
                    <div className="mb-2 text-sm font-medium">
                      Kapcsolódási üzenet:
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {template.connectionMessage}
                    </div>
                  </>
                ) : null}
              </div>
            </Card>
          </div>
        ))}

        <Button
          variant="outline"
          className="relative z-10 mt-4 flex items-center gap-2"
          onClick={addTemplate}
        >
          <Plus className="h-4 w-4" />
          Email hozzáadása
        </Button>
      </div>
    </div>
  );
}
