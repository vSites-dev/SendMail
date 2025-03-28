import { SESv2Client, CreateEmailIdentityCommand, GetEmailIdentityCommand, PutEmailIdentityMailFromAttributesCommand, PutEmailIdentityDkimSigningAttributesCommand } from "@aws-sdk/client-sesv2";
import { SESClient, VerifyDomainIdentityCommand, GetIdentityVerificationAttributesCommand } from "@aws-sdk/client-ses";
import { sesClient, sesv2Client } from "../config/aws";
import prisma from "../lib/prisma";
import { DomainStatus } from "@prisma/client";

// Define interface for DNS record
interface DnsRecord {
  type: string;
  name: string;
  value: string;
  purpose: string;
  recordType: string;
  token?: string; // Optional token for DKIM records
}

export class DomainService {
  private sesv2Client: SESv2Client;
  private sesClient: SESClient;

  constructor() {
    this.sesv2Client = sesv2Client;
    this.sesClient = sesClient;
  }

  async verifyDomain(domain: string, projectId: string) {
    try {
      // First, check if the domain already exists in our database
      const existingDomain = await prisma.domain.findFirst({
        where: { name: domain }
      });

      // If domain exists in our database, return it and update status
      if (existingDomain) {
        await this.checkDomainStatus(existingDomain.id);
        return {
          id: existingDomain.id,
          dkimAttributes: { Tokens: existingDomain.dkimTokens || [] },
          verificationToken: existingDomain.verificationToken,
          spfRecord: existingDomain.spfRecord,
          dmarcRecord: existingDomain.dmarcRecord,
          mailFromDomain: existingDomain.mailFromSubdomain,
          mailFromMxRecord: existingDomain.mailFromMxRecord,
        };
      }

      // Get domain verification token using SES API
      const verifyCommand = new VerifyDomainIdentityCommand({ Domain: domain });
      const verifyResponse = await this.sesClient.send(verifyCommand);
      const verificationToken = verifyResponse.VerificationToken;

      let dkimTokens: string[] = [];
      let statusMessage: string | null = null;
      
      // Try to create email identity in SESv2
      try {
        // Step 1: Create the identity first
        const createCommand = new CreateEmailIdentityCommand({
          EmailIdentity: domain,
          ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
        });
        const createResponse = await this.sesv2Client.send(createCommand);
        
        // Step 2: Enable EasyDKIM with 2048-bit keys (explicitly)
        const dkimCommand = new PutEmailIdentityDkimSigningAttributesCommand({
          EmailIdentity: domain,
          SigningAttributesOrigin: "AWS_SES",
          // AWS_SES origin doesn't need SigningAttributes
        });
        
        await this.sesv2Client.send(dkimCommand);
        console.log(`Successfully enabled EasyDKIM for domain ${domain}`);
        
        // Step 3: Now get the DKIM tokens
        const getIdentityCommand = new GetEmailIdentityCommand({
          EmailIdentity: domain
        });
        
        const identityResponse = await this.sesv2Client.send(getIdentityCommand);
        dkimTokens = identityResponse.DkimAttributes?.Tokens || [];
        
        if (dkimTokens.length === 0) {
          // Sometimes AWS needs a moment to generate tokens, try again after a short delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryResponse = await this.sesv2Client.send(getIdentityCommand);
          dkimTokens = retryResponse.DkimAttributes?.Tokens || [];
          
          if (dkimTokens.length === 0) {
            statusMessage = "DKIM tokens not immediately available. They will be retrieved during status checks.";
          }
        }
      } catch (error: any) {
        // If domain already exists in SES, get its DKIM tokens
        if (error.name === 'AlreadyExistsException') {
          statusMessage = "Domain already exists in AWS SES, fetching existing configuration";
          
          try {
            // Enable DKIM anyway in case it wasn't enabled
            const dkimCommand = new PutEmailIdentityDkimSigningAttributesCommand({
              EmailIdentity: domain,
              SigningAttributesOrigin: "AWS_SES"
              // AWS_SES origin doesn't need SigningAttributes - AWS will handle key generation
            });
            
            await this.sesv2Client.send(dkimCommand);
            console.log(`Enabled EasyDKIM for existing domain ${domain}`);
            
            // Get identity details including DKIM tokens
            const getIdentityCommand = new GetEmailIdentityCommand({
              EmailIdentity: domain
            });
            
            const identityResponse = await this.sesv2Client.send(getIdentityCommand);
            dkimTokens = identityResponse.DkimAttributes?.Tokens || [];
            
            if (dkimTokens.length === 0) {
              // Try again to fetch DKIM tokens - sometimes AWS takes a moment to generate them
              await new Promise(resolve => setTimeout(resolve, 2000));
              const retryResponse = await this.sesv2Client.send(getIdentityCommand);
              dkimTokens = retryResponse.DkimAttributes?.Tokens || [];
              
              if (dkimTokens.length === 0) {
                statusMessage = "DKIM not yet configured. Please check status later.";
              }
            }
          } catch (dkimError) {
            statusMessage = "Could not enable DKIM for existing domain";
            console.error("Error configuring DKIM:", dkimError);
          }
        } else {
          statusMessage = `Failed to create domain identity: ${error.message}`;
          throw error;
        }
      }

      // Set up MAIL FROM domain
      let mailFromSubdomain = `mail.${domain}`;
      let mailFromMxRecord = `feedback-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonses.com`;
      
      try {
        const mailFromCommand = new PutEmailIdentityMailFromAttributesCommand({
          EmailIdentity: domain,
          MailFromDomain: mailFromSubdomain,
        });
        await this.sesv2Client.send(mailFromCommand);
      } catch (error: any) {
        statusMessage = statusMessage || `Error setting up MAIL FROM domain: ${error.message}`;
        console.error("Error setting up MAIL FROM domain:", error);
      }

      // Generate DNS records
      const spfRecord = `v=spf1 include:amazonses.com ~all`;
      const dmarcRecord = `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}`;

      // Create domain record in database
      const domainRecord = await prisma.domain.create({
        data: {
          name: domain,
          status: "PENDING",
          statusMessage,
          dkimTokens: dkimTokens,
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
        dkimAttributes: { Tokens: dkimTokens },
        verificationToken,
        spfRecord,
        dmarcRecord,
        mailFromDomain: mailFromSubdomain,
        mailFromMxRecord,
      };
    } catch (error: any) {
      console.error("Error verifying domain:", error);
      
      // Create failed domain record if there was an error
      try {
        await prisma.domain.create({
          data: {
            name: domain,
            status: "FAILED",
            statusMessage: error.message || "Unknown error occurred during verification",
            project: {
              connect: { id: projectId }
            }
          }
        });
      } catch (dbError) {
        console.error("Error creating failed domain record:", dbError);
      }
      
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

      let verificationStatus, dkimStatus, mailFromStatus;
      let statusMessage: string | null = null;
      let dkimTokens: string[] = domain.dkimTokens || [];

      try {
        const response = await this.sesv2Client.send(command);
        
        // Extract status values
        verificationStatus = response.VerificationStatus;
        dkimStatus = response.DkimAttributes?.Status;
        mailFromStatus = response.MailFromAttributes?.MailFromDomainStatus;
        
        // If we didn't have DKIM tokens before, try to get them now
        if (dkimTokens.length === 0 && response.DkimAttributes?.Tokens) {
          dkimTokens = response.DkimAttributes.Tokens;
          console.log(`Retrieved ${dkimTokens.length} DKIM tokens during status check`);
        }
        
        // Update domain status based on verification results
        let newStatus: DomainStatus = domain.status;

        if (verificationStatus === "SUCCESS" && dkimStatus === "SUCCESS" && mailFromStatus === "SUCCESS") {
          newStatus = "VERIFIED";
          statusMessage = "Domain verified successfully";
        } else if (verificationStatus === "SUCCESS" && dkimStatus === "SUCCESS") {
          newStatus = "DKIM_VERIFIED";
          statusMessage = "Domain and DKIM verified, MAIL FROM pending";
        } else if (verificationStatus === "SUCCESS") {
          newStatus = "DKIM_PENDING";
          statusMessage = "Domain verified, DKIM pending verification";
        } else if (verificationStatus === "FAILED" || dkimStatus === "FAILED" || mailFromStatus === "FAILED") {
          newStatus = "FAILED";
          
          if (verificationStatus === "FAILED")
            statusMessage = "Domain verification failed. Please check TXT record";
          else if (dkimStatus === "FAILED")
            statusMessage = "DKIM verification failed. Please check CNAME records";
          else
            statusMessage = "MAIL FROM verification failed. Please check MX record";
        } else {
          newStatus = "PENDING";
          statusMessage = "Verification pending. Please add DNS records and wait for propagation";
        }

        // Update domain record with latest status and DKIM tokens if we got new ones
        await prisma.domain.update({
          where: { id: domainId },
          data: { 
            status: newStatus,
            statusMessage,
            dkimTokens: dkimTokens.length > 0 ? dkimTokens : undefined
          }
        });

        return {
          id: domain.id,
          name: domain.name,
          status: newStatus,
          statusMessage,
          verificationStatus,
          dkimStatus,
          mailFromStatus,
          dkimTokens: dkimTokens
        };
      } catch (error: any) {
        console.error("Error fetching identity status:", error);
        
        // Update domain with error message
        const updatedDomain = await prisma.domain.update({
          where: { id: domainId },
          data: { 
            statusMessage: `Error checking verification status: ${error.message}`
          }
        });
        
        return {
          id: updatedDomain.id,
          name: updatedDomain.name,
          status: updatedDomain.status,
          statusMessage: updatedDomain.statusMessage,
          verificationStatus: "FAILED",
          dkimStatus: "FAILED",
          mailFromStatus: "FAILED",
        };
      }
    } catch (error) {
      console.error("Error checking domain status:", error);
      throw error;
    }
  }

  async getDnsRecords(domainId: string): Promise<DnsRecord[]> {
    const domain = await prisma.domain.findUnique({
      where: { id: domainId }
    });

    if (!domain) {
      throw new Error("Domain not found");
    }

    // If we don't have DKIM tokens yet, try to get them
    if (!domain.dkimTokens || domain.dkimTokens.length === 0) {
      try {
        console.log(`No DKIM tokens for domain ${domain.name}, attempting to fetch them`);
        const getIdentityCommand = new GetEmailIdentityCommand({
          EmailIdentity: domain.name
        });
        
        const identityResponse = await this.sesv2Client.send(getIdentityCommand);
        const dkimTokens = identityResponse.DkimAttributes?.Tokens || [];
        
        if (dkimTokens.length > 0) {
          console.log(`Retrieved ${dkimTokens.length} DKIM tokens during DNS records fetch`);
          // Update the domain with the newly found tokens
          await prisma.domain.update({
            where: { id: domainId },
            data: { dkimTokens }
          });
          
          // Update our local reference to use these tokens
          domain.dkimTokens = dkimTokens;
        }
      } catch (error) {
        console.error("Error fetching DKIM tokens during DNS records:", error);
        // Continue even if we can't get the tokens
      }
    }

    // Construct DNS records
    const dnsRecords: DnsRecord[] = [
      {
        type: "TXT",
        name: domain.name,
        value: domain.verificationToken || "",
        purpose: "Domain Verification",
        recordType: "TXT"
      },
      {
        type: "SPF",
        name: domain.name,
        value: domain.spfRecord || "",
        purpose: "SPF Record",
        recordType: "TXT"
      },
      {
        type: "DMARC",
        name: `_dmarc.${domain.name}`,
        value: domain.dmarcRecord || "",
        purpose: "DMARC Record",
        recordType: "TXT"
      },
      {
        type: "MX",
        name: domain.mailFromSubdomain || "",
        value: domain.mailFromMxRecord || "",
        purpose: "MAIL FROM Domain",
        recordType: "MX"
      }
    ];
    
    // Add DKIM records if we have tokens
    if (domain.dkimTokens && domain.dkimTokens.length > 0) {
      domain.dkimTokens.forEach((token, index) => {
        dnsRecords.push({
          type: "DKIM",
          name: `${token}._domainkey.${domain.name}`,
          value: `${token}.dkim.amazonses.com`,
          purpose: `DKIM Record ${index + 1}`,
          recordType: "CNAME",
          token: token
        });
      });
    }

    return dnsRecords;
  }
}
