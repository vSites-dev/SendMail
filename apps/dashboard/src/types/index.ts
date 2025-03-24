import { Template } from "@prisma/client";

export type EmailBlock = {
  id: string;
  template: Template;
  subject: string;
  scheduledDate?: Date;
  scheduledTime?: string;
};

export type CampaignSettings = {
  name: string;
  trackLinks: boolean;
};
