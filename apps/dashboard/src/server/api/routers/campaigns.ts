import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import {
  CampaignStatus,
  EmailStatus,
  TaskStatus,
  TaskType,
} from "@prisma/client";

export function parseMarkdownLinks(
  markdown: string,
): { text: string; href: string }[] {
  const links: { text: string; href: string }[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push({
      text: match[1],
      href: match[2],
    });
  }

  return links;
}

// Helper function to replace links with tracking links
export async function replaceLinksWithTracking(
  markdown: string,
  emailId: string,
  ctx: any,
): Promise<{
  processedMarkdown: string;
  clicks: { id: string; link: string; emailId: string; status: string }[];
}> {
  const links = parseMarkdownLinks(markdown);
  const clicks: {
    id: string;
    link: string;
    emailId: string;
    status: string;
  }[] = [];
  let processedMarkdown = markdown;

  for (const link of links) {
    const click = await ctx.db.click.create({
      data: {
        link: link.href,
        emailId: emailId,
      },
    });

    clicks.push({
      id: click.id,
      link: link.href,
      emailId: emailId,
      status: "PENDING",
    });

    // Replace the original link with the tracking link
    const trackingUrl = `${process.env.NEXT_PUBLIC_API_URL}/track/${click.id}`;
    processedMarkdown = processedMarkdown.replace(
      `[${link.text}](${link.href})`,
      `[${link.text}](${trackingUrl})`,
    );
  }

  return { processedMarkdown, clicks };
}

// Helper function to replace contact variables in the email body
export async function replaceContactVariables(
  markdown: string,
  contactId: string,
  ctx: any,
): Promise<string> {
  // Get contact details
  const contact = await ctx.db.contact.findUnique({
    where: { id: contactId },
    select: { name: true, email: true },
  });

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Replace {{name}} with contact's name
  // Replace {{email}} with contact's email
  return markdown
    .replace(/{{name}}/g, contact.name || "")
    .replace(/{{email}}/g, contact.email || "");
}

export const campaignRouter = createTRPCRouter({
  addContactsWithEmails: authedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        contactIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First, get the campaign to verify it exists and to get the email templates
        const campaign = await ctx.db.campaign.findUnique({
          where: {
            id: input.campaignId,
          },
          include: {
            emails: {
              distinct: ["subject", "from"],
              select: {
                id: true,
                subject: true,
                from: true,
                body: true,
                status: true,
              },
            },
            contacts: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!campaign) {
          throw new Error("Kampány nem található");
        }

        // Find contacts that are not already in the campaign
        const existingContactIds = campaign.contacts.map((c) => c.id);
        const newContactIds = input.contactIds.filter(
          (id) => !existingContactIds.includes(id),
        );

        if (newContactIds.length === 0) {
          return {
            success: false,
            error:
              "A kiválasztott kontaktok már hozzá vannak adva a kampányhoz",
          };
        }

        // Add the contacts to the campaign
        await ctx.db.campaign.update({
          where: {
            id: input.campaignId,
          },
          data: {
            contacts: {
              connect: newContactIds.map((id) => ({ id })),
            },
          },
        });

        // Create emails for each new contact for each distinct email in the campaign
        const uniqueEmails = campaign.emails.filter(
          (email, index, self) =>
            index ===
            self.findIndex(
              (e) => e.subject === email.subject && e.from === email.from,
            ),
        );

        if (uniqueEmails.length > 0) {
          // Create emails for each new contact for each unique email
          const emailsToCreate = newContactIds.flatMap((contactId) =>
            uniqueEmails.map((email) => ({
              subject: email.subject,
              from: email.from,
              body: email.body,
              status: EmailStatus.QUEUED,
              campaignId: campaign.id,
              contactId: contactId,
            })),
          );

          await ctx.db.email.createMany({
            data: emailsToCreate,
          });

          // Get the last created emails to create tasks for them
          const createdEmails = await ctx.db.email.findMany({
            where: {
              campaignId: campaign.id,
              contactId: {
                in: newContactIds,
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: emailsToCreate.length,
          });

          // Get tasks related to the original emails to use their scheduledAt times
          const tasks = await ctx.db.task.findMany({
            where: {
              campaignId: campaign.id,
              emailId: {
                in: uniqueEmails.map((e) => e.id),
              },
            },
            select: {
              scheduledAt: true,
              email: {
                select: {
                  subject: true,
                  from: true,
                },
              },
            },
          });

          // Create tasks for the new emails
          if (tasks.length > 0) {
            const tasksToCreate = createdEmails.map((email) => {
              // Find matching task by subject and from
              const matchingTask = tasks.find(
                (t) =>
                  t.email?.subject === email.subject &&
                  t.email?.from === email.from,
              );

              return {
                type: TaskType.SEND_EMAIL,
                status: TaskStatus.PENDING,
                scheduledAt: matchingTask?.scheduledAt || new Date(),
                projectId: ctx.session.activeProjectId,
                campaignId: campaign.id,
                emailId: email.id,
              };
            });

            await ctx.db.task.createMany({
              data: tasksToCreate,
            });
          }
        }

        return {
          success: true,
        };
      } catch (error) {
        console.error("Error adding contacts to campaign:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Hiba történt a kontaktok hozzáadása során",
        };
      }
    }),

  scheduledCampaignsCount: authedProcedure
    .input(
      z.object({
        timeInterval: z.number(),
      }),
    )
    .query(async ({ input: { timeInterval }, ctx }) => {
      if (!ctx.session.activeProjectId) return;

      const [currentCount, previousCount] = await Promise.all([
        // current period
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
            status: CampaignStatus.SCHEDULED,
            createdAt: {
              gte: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // for previous period
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
            status: CampaignStatus.SCHEDULED,
            createdAt: {
              lt: new Date(Date.now() - timeInterval * 24 * 60 * 60 * 1000),
              gte: new Date(
                Date.now() - timeInterval * 2 * 24 * 60 * 60 * 1000,
              ),
            },
          },
        }),
      ]);

      return {
        value: currentCount ?? 0,
        previousValue: previousCount ?? 0,
      };
    }),

  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.campaign.findMany({
      where: {
        projectId: ctx.session.activeProjectId,
      },
    });
  }),

  getForTable: authedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50),
        offset: z.number().min(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;

      await withOrganization({
        organizationId: ctx.session.session.activeOrganizationId,
      });

      const [campaigns, totalCount] = await Promise.all([
        ctx.db.campaign.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: limit,
          skip: offset,
          include: {
            contacts: {
              select: {
                id: true,
              },
            },
            emails: {
              select: {
                id: true,
              },
            },
          },
        }),
        ctx.db.campaign.count({
          where: {
            projectId: ctx.session.activeProjectId,
          },
        }),
      ]);

      return {
        items: campaigns,
        totalCount,
      };
    }),

  getByName: authedProcedure
    .input(
      z.object({
        searchText: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { searchText } = input;

      await withOrganization({
        organizationId: ctx.session.session.activeOrganizationId,
      });

      if (!searchText || searchText.trim() === "") {
        return {
          items: [],
          totalCount: 0,
        };
      }

      const campaigns = await ctx.db.campaign.findMany({
        where: {
          projectId: ctx.session.activeProjectId,
          name: {
            contains: searchText,
            mode: "insensitive",
          },
        },
        include: {
          contacts: {
            select: {
              id: true,
            },
          },
          emails: {
            select: {
              id: true,
            },
          },
        },
      });

      // Transform the data to include counts
      const items = campaigns.map((campaign) => ({
        ...campaign,
        contactsCount: campaign.contacts.length,
        emailsCount: campaign.emails.length,
        // Remove the arrays to avoid sending too much data
        contacts: undefined,
        emails: undefined,
      }));

      return {
        items,
        totalCount: items.length,
      };
    }),

  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.campaign.findUnique({
        where: {
          id: input.id,
        },
        include: {
          contacts: true,
          emails: true,
        },
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.campaign.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting campaign", e);
        return {
          success: false,
          error: "Hiba történt a kampány törlése során.",
        };
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        contactIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newCampaign = await ctx.db.campaign.create({
          data: {
            name: input.name,
            status: CampaignStatus.SCHEDULED,
            projectId: ctx.session.activeProjectId,
            contacts: input.contactIds
              ? {
                  connect: input.contactIds.map((id) => ({ id })),
                }
              : undefined,
          },
          select: { id: true },
        });

        return {
          success: true,
          id: newCampaign.id,
        };
      } catch (error) {
        console.error("Error creating campaign:", error);
        return {
          success: false,
          error: "Hiba történt a kampány létrehozása során.",
        };
      }
    }),

  createWithEmailsAndTasks: authedProcedure
    .input(
      z.object({
        name: z.string(),
        contactIds: z.array(z.string()),
        emailBlocks: z.array(
          z.object({
            templateId: z.string(),
            subject: z.string(),
            from: z.string(),
            date: z.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const campaign = await ctx.db.campaign.create({
          data: {
            name: input.name,
            status: CampaignStatus.SCHEDULED,
            projectId: ctx.session.activeProjectId,
            contacts: {
              connect: input.contactIds.map((id) => ({ id })),
            },
          },
        });

        const templates = await ctx.db.template.findMany({
          where: {
            id: {
              in: input.emailBlocks.map((block) => block.templateId),
            },
          },
        });

        // For each contact and each email block, create an email
        const flattenedEmailPromises = input.contactIds.flatMap((contactId) =>
          input.emailBlocks.map(async (block) => {
            const t = templates.find(
              (template) => template.id === block.templateId,
            );
            if (!t) throw new Error("Template not found");

            // Replace contact variables in the body
            const bodyWithVariables = await replaceContactVariables(
              t.body,
              contactId,
              ctx,
            );

            // Create email first
            const email = await ctx.db.email.create({
              data: {
                subject: block.subject,
                from: block.from,
                body: bodyWithVariables,
                status: EmailStatus.QUEUED as EmailStatus,
                campaignId: campaign.id,
                contactId: contactId,
              },
            });

            // Process links and create tracking objects
            const { processedMarkdown, clicks } =
              await replaceLinksWithTracking(bodyWithVariables, email.id, ctx);

            // Update email with processed markdown
            await ctx.db.email.update({
              where: { id: email.id },
              data: { body: processedMarkdown },
            });

            return email;
          }),
        );

        const createdEmails = await Promise.all(flattenedEmailPromises);

        const tasks = await Promise.all(
          createdEmails.map(async (email) => {
            const block = input.emailBlocks.find(
              (b) => b.subject === email.subject && b.from === email.from,
            );

            if (!block) throw new Error("Matching email block not found");

            return ctx.db.task.create({
              data: {
                type: TaskType.SEND_EMAIL,
                status: TaskStatus.PENDING,
                scheduledAt: block.date,
                projectId: ctx.session.activeProjectId,
                campaignId: campaign.id,
                emailId: email.id,
              },
            });
          }),
        );

        return {
          success: true,
          campaign,
          createdEmails,
          tasks,
        };
      } catch (error) {
        console.error("Error creating campaign with task:", error);
        return {
          success: false,
          error: "Hiba történt a kampány és feladat létrehozása során.",
        };
      }
    }),
});

type CampaignRouter = typeof campaignRouter;

type CampaignRouterOutputs = inferRouterOutputs<CampaignRouter>;

export type Campaign = CampaignRouterOutputs["getAll"][number];
export type GetByIdCampaignType = CampaignRouterOutputs["getById"];
export type GetForTableCampaignType =
  CampaignRouterOutputs["getForTable"]["items"][number];
