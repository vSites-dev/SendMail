import {
  authedProcedure,
  createTRPCRouter,
  withOrganization,
} from "@/server/api/trpc";
import { DomainStatus } from "@prisma/client";

import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import type { PrismaClient, Domain } from "@prisma/client";

// Extract the domain verification logic into a reusable helper function
async function verifyDomainHelper(
  db: PrismaClient,
  domainName: string,
  projectId: string,
) {
  try {
    // First, check if the domain already exists in our database
    const existingDomain = await db.domain.findFirst({
      where: {
        name: domainName,
        projectId: projectId,
      },
    });

    if (existingDomain) {
      // If domain exists, return it directly
      return {
        success: true,
        id: existingDomain.id,
      };
    }

    // Call the backend API to verify domain using fetch
    const response = await fetch(`${process.env.API_URL}/domains/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: domainName,
        projectId: projectId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      const domainData = data.data;

      // Create domain in database with verification data
      const domain = await db.domain.create({
        data: {
          name: domainName,
          status: "PENDING",
          dkimTokens: domainData.dkimAttributes?.Tokens || [],
          verificationToken: domainData.verificationToken,
          spfRecord: domainData.spfRecord,
          dmarcRecord: domainData.dmarcRecord,
          mailFromSubdomain: domainData.mailFromDomain,
          mailFromMxRecord: domainData.mailFromMxRecord,
          projectId: projectId,
        },
      });

      return {
        success: true,
        id: domain.id,
      };
    } else {
      throw new Error(data.error || "Domain verification failed");
    }
  } catch (error) {
    console.error("Error verifying domain:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Hiba történt a domain ellenőrzése során.",
    };
  }
}

export const domainRouter = createTRPCRouter({
  getAll: authedProcedure.query(async ({ ctx }) => {
    return await ctx.db.domain.findMany({
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

      console.log("get for table", ctx.session.activeProjectId);

      const [items, totalCount] = await Promise.all([
        ctx.db.domain.findMany({
          where: {
            projectId: ctx.session.activeProjectId,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        ctx.db.domain.count({
          where: {
            projectId: ctx.session.activeProjectId,
          },
        }),
      ]);

      console.log("items", items);

      return {
        items,
        totalCount,
      };
    }),

  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.domain.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  getDnsRecords: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {

        const domain = await ctx.db.domain.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!domain) {
          throw new Error("Domain not found");
        }

        return domain;
      } catch (error) {
        console.error("Error fetching DNS records:", error);
        throw new Error("Failed to fetch DNS records");
      }
    }),

  verifyDomain: authedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Use the helper function for domain verification
      return await verifyDomainHelper(
        ctx.db,
        input.name,
        ctx.session.activeProjectId,
      );
    }),

  checkVerificationStatus: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const domain = await ctx.db.domain.findUnique({
          where: {
            id: input.id,
          },
        });

        if (!domain) {
          throw new Error("Domain not found");
        }

        // Call the backend API to check verification status using fetch
        const response = await fetch(
          `${process.env.API_URL}/domains/status/${input.id}`,
        );

        if (!response.ok) {
          throw new Error(
            `Error checking domain status: ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.success) {
          const statusData = data.data;

          // Update domain status in database
          await ctx.db.domain.update({
            where: {
              id: input.id,
            },
            data: {
              status: statusData.status as DomainStatus,
            },
          });

          return {
            success: true,
            status: statusData,
          };
        } else {
          throw new Error(data.error || "Failed to check domain status");
        }
      } catch (error) {
        console.error("Error checking domain verification status:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Hiba történt a domain státuszának ellenőrzése során.",
        };
      }
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: check if domain is attached to any active scheduled campaign/email

        await ctx.db.domain.delete({
          where: {
            id: input.id,
          },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error deleting domain", e);
        return {
          success: false,
          error: "Hiba történt a domain törlése során.",
        };
      }
    }),

  updateStatus: authedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "PENDING",
          "VERIFIED",
          "FAILED",
          "DKIM_PENDING",
          "DKIM_VERIFIED",
          "DKIM_FAILED",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.domain.update({
          where: { id: input.id },
          data: { status: input.status as DomainStatus },
        });

        return {
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating domain status", e);
        return {
          success: false,
          error: "Hiba történt a domain státuszának frissítése során.",
        };
      }
    }),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        status: z.enum([
          "PENDING",
          "VERIFIED",
          "FAILED",
          "DKIM_PENDING",
          "DKIM_VERIFIED",
          "DKIM_FAILED",
        ]),
        dkimTokens: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.domain.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            status: input.status as DomainStatus,
            dkimTokens: input.dkimTokens,
          },
        });

        return {
          id: input.id,
          success: true,
          error: null,
        };
      } catch (e) {
        console.error("Error updating domain", e);
        return {
          success: false,
          error: "Hiba történt a domain frissítése során.",
        };
      }
    }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
        dkimTokens: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Use the helper function for domain verification
        return await verifyDomainHelper(
          ctx.db,
          input.name,
          ctx.session.activeProjectId,
        );
      } catch (error) {
        console.error("Error creating domain:", error);
        return {
          success: false,
          error: "Hiba történt a domain létrehozása során.",
        };
      }
    }),
});

export type DomainRouterOutputs = inferRouterOutputs<typeof domainRouter>;
