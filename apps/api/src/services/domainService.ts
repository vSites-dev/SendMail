import { SESv2Client, CreateEmailIdentityCommand, GetEmailIdentityCommand, PutEmailIdentityMailFromAttributesCommand } from "@aws-sdk/client-sesv2";
import { SESClient, VerifyDomainIdentityCommand } from "@aws-sdk/client-ses";
import { sesClient, sesv2Client } from "../config/aws";
import prisma from "../lib/prisma";
import { DomainStatus } from "@prisma/client";

export class DomainService {
  private sesv2Client: SESv2Client;
  private sesClient: SESClient;

  constructor() {
    this.sesv2Client = sesv2Client;
    this.sesClient = sesClient;
  }

  async verifyDomain(domain: string, projectId: string) {
    try {
      // Step 1: Get domain verification token using SES API
      const verifyCommand = new VerifyDomainIdentityCommand({ Domain: domain });
      const verifyResponse = await this.sesClient.send(verifyCommand);
      const verificationToken = verifyResponse.VerificationToken;

      // Step 2: Create email identity and get DKIM tokens using SESv2 API
      const createCommand = new CreateEmailIdentityCommand({
        EmailIdentity: domain,
        ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
      });
      const createResponse = await this.sesv2Client.send(createCommand);

      // Step 3: Set up MAIL FROM domain
      const mailFromSubdomain = `mail.${domain}`;
      const mailFromCommand = new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: domain,
        MailFromDomain: mailFromSubdomain,
      });
      await this.sesv2Client.send(mailFromCommand);

      // Step 4: Generate DNS records
      const spfRecord = `v=spf1 include:amazonses.com ~all`;
      const dmarcRecord = `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}`;
      const mailFromMxRecord = `feedback-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonses.com`;

      // Create domain record in database
      const domainRecord = await prisma.domain.create({
        data: {
          name: domain,
          status: "PENDING",
          dkimTokens: createResponse.DkimAttributes?.Tokens || [],
          verificationToken,
          spfRecord,
          dmarcRecord,
          mailFromSubdomain,
          mailFromMxRecord,
          project: {
            connect: { id: projectId }
          }
        }
      });

      return {
        id: domainRecord.id,
        dkimAttributes: createResponse.DkimAttributes,
        verificationToken,
        spfRecord,
        dmarcRecord,
        mailFromDomain: mailFromSubdomain,
        mailFromMxRecord,
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

      const response = await this.sesv2Client.send(command);

      // Update domain status based on verification results
      const verificationStatus = response.VerificationStatus;
      const dkimStatus = response.DkimAttributes?.Status;
      const mailFromStatus = response.MailFromAttributes?.MailFromDomainStatus;

      let newStatus: DomainStatus = domain.status;

      // Update verification status based on all checks
      if (verificationStatus === "SUCCESS" && dkimStatus === "SUCCESS" && mailFromStatus === "SUCCESS") {
        newStatus = "VERIFIED";
      } else if (verificationStatus === "SUCCESS") {
        newStatus = dkimStatus === "SUCCESS" ? "DKIM_VERIFIED" : "DKIM_PENDING";
      } else if (verificationStatus === "FAILED" || dkimStatus === "FAILED" || mailFromStatus === "FAILED") {
        newStatus = "FAILED";
      } else {
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
        mailFromStatus,
      };
    } catch (error) {
      console.error("Error checking domain status:", error);
      throw error;
    }
  }

  async getDnsRecords(domainId: string) {
    const domain = await prisma.domain.findUnique({
      where: { id: domainId }
    });

    if (!domain) {
      throw new Error("Domain not found");
    }

    // Construct DNS records
    const dnsRecords = [
      {
        type: "TXT",
        name: domain.name,
        value: domain.verificationToken,
        purpose: "Domain Verification"
      },
      {
        type: "TXT",
        name: domain.name,
        value: domain.spfRecord,
        purpose: "SPF Record"
      },
      {
        type: "TXT",
        name: `_dmarc.${domain.name}`,
        value: domain.dmarcRecord,
        purpose: "DMARC Record"
      },
      {
        type: "MX",
        name: domain.mailFromSubdomain,
        value: domain.mailFromMxRecord,
        purpose: "MAIL FROM Domain"
      },
      ...domain.dkimTokens.map((token, index) => ({
        type: "CNAME",
        name: `${token}._domainkey.${domain.name}`,
        value: `${token}.dkim.amazonses.com`,
        purpose: `DKIM Record ${index + 1}`
      }))
    ];

    return dnsRecords;
  }
}
