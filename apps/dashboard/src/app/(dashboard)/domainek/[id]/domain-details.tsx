"use client";

import {
  Globe,
  Copy,
  CheckCircle,
  ArrowUpRightFromSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Domain } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardContent,
  CardSeparator,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn, domainStatuses } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  purpose: string;
}

export function DomainDetails({ domain }: { domain: Domain }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  const utils = api.useUtils();

  const { data: records, isLoading: isLoadingDnsRecords, error: dnsRecordsError } =
    api.domain.getDnsRecords.useQuery({ id: domain.id }, {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    });

  useEffect(() => {
    if (records) {
      // Transform domain data into DNS records format
      const dnsRecordsList: DnsRecord[] = [
        {
          type: 'TXT',
          name: domain.name,
          value: records.verificationToken || '',
          purpose: 'Domain verification'
        },
        {
          type: 'SPF',
          name: domain.name,
          value: records.spfRecord || '',
          purpose: 'Email authentication'
        },
        {
          type: 'DMARC',
          name: `_dmarc.${domain.name}`,
          value: records.dmarcRecord || '',
          purpose: 'Email authentication policy'
        },
        {
          type: 'MX',
          name: records.mailFromSubdomain || '',
          value: records.mailFromMxRecord || '',
          purpose: 'Mail server configuration'
        },
        ...records.dkimTokens.map((token, index) => ({
          type: 'DKIM',
          name: `${index}._domainkey.${domain.name}`,
          value: token,
          purpose: 'Email signing key'
        }))
      ];

      setDnsRecords(dnsRecordsList);
      setIsLoadingRecords(false);
    }
  }, [records, domain.name]);

  useEffect(() => {
    if (dnsRecordsError) {
      console.error("Error fetching DNS records:", dnsRecordsError);
      setIsLoadingRecords(false);
      toast.error("Nem sikerült betölteni a DNS beállításokat");
    }
  }, [dnsRecordsError]);

  const { mutateAsync: checkVerificationStatus } =
    api.domain.checkVerificationStatus.useMutation();

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyDomain = async () => {
    setIsVerifying(true);
    try {
      const result = await checkVerificationStatus({ id: domain.id });

      if (result.success) {
        utils.domain.getById.invalidate({ id: domain.id });
        toast.success("Domain státusz frissítve!");
      } else {
        toast.error(
          result.error || "Nem sikerült ellenőrizni a domain státuszát",
        );
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast.error("Hiba történt a domain ellenőrzése során");
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rounded-lg">
          <div
            className={cn(
              "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border",
              domainStatuses[domain.status].color,
              domainStatuses[domain.status].borderColor,
            )}
          >
            <Globe className="size-6" />
          </div>

          <h1 className={cn("text-2xl title")}>
            {domain.name}
          </h1>
        </div>

        <Button
          onClick={handleVerifyDomain}
          disabled={isVerifying}
          className="gap-2"
        >
          {isVerifying ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Ellenőrzés
        </Button>
      </div>

      <Card>
        <div className="overflow-hidden rounded-t-[15.5px] bg-stone-100 dark:bg-neutral-800 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground">
                LÉTREHOZVA
              </p>
              <p>{new Date(domain.createdAt).toLocaleDateString("hu-HU")}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground">
                STÁTUSZ
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-2 rounded-[2px]",
                    domainStatuses[domain.status].bgColor,
                  )}
                />
                {domainStatuses[domain.status].label}
              </div>
            </div>
          </div>
        </div>

        <CardSeparator />

        <CardContent className="my-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-700">
              DNS Beállítások
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1">
                    {getStatusIcon(domain.status)}
                    {domain.status === "VERIFIED"
                      ? "Ellenőrizve"
                      : domain.status === "FAILED"
                        ? "Sikertelen"
                        : "Függőben"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {domain.status === "VERIFIED"
                      ? "A domain sikeresen ellenőrizve lett"
                      : domain.status === "FAILED"
                        ? "A domain ellenőrzése sikertelen volt"
                        : "A domain ellenőrzése folyamatban van"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Az alábbi DNS beállításokat kell elvégezned a domain szolgáltatódnál,
            hogy az email küldés működjön. Az ellenőrzés akár 24-48 órát is
            igénybe vehet a DNS propagáció miatt.
          </p>

          {isLoadingRecords ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Típus</th>
                    <th className="p-3 text-left text-sm font-medium">
                      Host / Név
                    </th>
                    <th className="p-3 text-left text-sm font-medium">Érték</th>
                    <th className="p-3 text-left text-sm font-medium">Cél</th>
                  </tr>
                </thead>
                <tbody>
                  {dnsRecords.map((record, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{record.type}</td>
                      <td className="p-3">{record.name}</td>
                      <td className="group relative p-3">
                        <span className="mr-8 break-all">{record.value}</span>
                        <button
                          onClick={() =>
                            handleCopy(record.value, `record-${index}`)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          {copiedField === `record-${index}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">{record.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        <CardSeparator />

        <CardContent className="my-4">
          <h2 className="text-lg font-semibold mb-2 text-neutral-700">
            Beállítások
          </h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex relative p-[4px] items-center justify-center rounded-sm bg-neutral-50 text-2xl font-semibold border text-neutral-600",
                  )}
                >
                  <ArrowUpRightFromSquare className="size-[14px]" />
                </div>
                <p className="font-medium">Linkek nyomon követése</p>
              </div>

              <p className="text-sm text-muted-foreground mt-1 ml-1">
                Az emailben lévő hivatkozásokat módosítjuk a kattintások nyomon
                követéséhez. A felhasználó észrevétlenül átirányításra kerül az
                eredeti linkre.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
