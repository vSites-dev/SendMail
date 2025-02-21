import { SESv2Client, CreateEmailIdentityCommand, GetEmailIdentityCommand } from "@aws-sdk/client-sesv2";
import { sesv2Client } from "../config/aws";
import prisma from "../lib/prisma";
import { DomainStatus } from "@prisma/client";

export class DomainService {
  private client: SESv2Client;

  constructor() {
    this.client = sesv2Client;
  }

  async verifyDomain(domain: string, projectId: string) {
    try {
      const command = new CreateEmailIdentityCommand({
        EmailIdentity: domain,
        ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
      });

      const response = await this.client.send(command);

      // Create domain record in database
      const domainRecord = await prisma.domain.create({
        data: {
          name: domain,
          status: "PENDING",
          dkimTokens: response.DkimAttributes?.Tokens || [],
          project: {
            connect: { id: projectId }
          }
        }
      });

      return {
        id: domainRecord.id,
        dkimAttributes: response.DkimAttributes,
      };
    } catch (error) {
      console.error("Error verifying domain:", error);
      throw error;
    }
  }

  async checkDomainStatus(domainId: string) {
    try {
      const domain = await prisma.domain.findUnique({
        where: { id: domainId }
      });

      if (!domain) {
        throw new Error("Domain not found");
      }

      const command = new GetEmailIdentityCommand({
        EmailIdentity: domain.name,
      });

      const response = await this.client.send(command);

      // Update domain status based on verification results
      const verificationStatus = response.VerificationStatus;
      const dkimStatus = response.DkimAttributes?.Status;

      let newStatus: DomainStatus = domain.status;

      // Update verification status
      if (verificationStatus === "SUCCESS") {
        newStatus = dkimStatus === "SUCCESS" ? "DKIM_VERIFIED" : "DKIM_PENDING";
      } else if (verificationStatus === "FAILED") {
        newStatus = "FAILED";
      } else if (verificationStatus === "PENDING") {
        newStatus = "PENDING";
      }

      // Update domain record
      const updatedDomain = await prisma.domain.update({
        where: { id: domainId },
        data: { status: newStatus }
      });

      return {
        id: updatedDomain.id,
        name: updatedDomain.name,
        status: updatedDomain.status,
        verificationStatus,
        dkimStatus,
      };
    } catch (error) {
      console.error("Error checking domain status:", error);
      throw error;
    }
  }
}
