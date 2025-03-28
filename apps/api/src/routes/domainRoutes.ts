import { Router } from "express";
import { DomainService } from "../services/domainService";
import { z } from "zod";

const router = Router();
const domainService = new DomainService();

// Schema for domain verification request
const verifyDomainSchema = z.object({
  domain: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/),
  projectId: z.string().uuid(),
});

// Verify a new domain
router.post("/verify", async (req, res) => {
  try {
    const { domain, projectId } = verifyDomainSchema.parse(req.body);

    const verificationResult = await domainService.verifyDomain(
      domain,
      projectId
    );

    res.json({
      success: true,
      data: verificationResult,
    });
  } catch (error) {
    console.error("Error in domain verification:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Check domain verification status
router.get("/status/:id", async (req, res) => {
  try {
    const id = z.string().uuid().parse(req.params.id);

    const status = await domainService.checkDomainStatus(id);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error checking domain status:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Get DNS records for a domain
router.get("/dns-records/:id", async (req, res) => {
  try {
    const id = z.string().uuid().parse(req.params.id);

    const dnsRecords = await domainService.getDnsRecords(id);

    res.json({
      success: true,
      data: dnsRecords,
    });
  } catch (error) {
    console.error("Error getting DNS records:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
