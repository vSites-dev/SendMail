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
  recordType: string;
  token?: string;
}

export function DomainDetails({ domain }: { domain: Domain }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  const utils = api.useUtils();

  const { data: records, isLoading: isLoadingDnsRecords, error: dnsRecordsError } =
    api.domain.getDnsRecords.useQuery({ domainId: domain.id }, {
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
          purpose: 'Domain verification',
          recordType: 'TXT',
        },
        {
          type: 'SPF',
          name: domain.name,
          value: records.spfRecord || '',
          purpose: 'Email authentication',
          recordType: 'TXT',
        },
        {
          type: 'DMARC',
          name: `_dmarc.${domain.name}`,
          value: records.dmarcRecord || '',
          purpose: 'Email authentication policy',
          recordType: 'TXT',
        },
        {
          type: 'MX',
          name: records.mailFromSubdomain || '',
          value: records.mailFromMxRecord || '',
          purpose: 'Mail server configuration',
          recordType: 'MX',
        },
      ];

      // Add DKIM records if available
      if (records.dkimTokens && records.dkimTokens.length > 0) {
        records.dkimTokens.forEach((token, index) => {
          dnsRecordsList.push({
            type: 'DKIM',
            name: `${token}._domainkey.${domain.name}`,
            value: `${token}.dkim.amazonses.com`,
            purpose: 'Email signing key',
            recordType: 'CNAME',
            token,
          });
        });
      }

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
          
          {domain.statusMessage && (
            <div className="mt-4">
              <p className="text-xs uppercase font-bold text-muted-foreground">
                ÁLLAPOT ÜZENET
              </p>
              <p className="text-sm mt-1">{domain.statusMessage}</p>
            </div>
          )}

          <div className="mt-4">
            <div className="text-xs uppercase font-bold text-muted-foreground mb-2">
              DNS HITELESÍTÉS
            </div>
            <div className="text-sm bg-white dark:bg-neutral-900 p-3 rounded-md">
              <p className="mb-2">
                A domain teljes hitelesítéséhez adja hozzá az alábbi DNS rekordokat a domain beállításaiban. A beállítások elvégzése után kattintson az "Ellenőrzés" gombra.
              </p>
            </div>
          </div>
        </div>

        <CardSeparator />

        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">DNS beállítások</h3>
            <div className="overflow-x-auto">
              {isLoadingRecords ? (
                <div className="space-y-2">
                  <Skeleton className="w-full h-[60px]" />
                  <Skeleton className="w-full h-[60px]" />
                  <Skeleton className="w-full h-[60px]" />
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-neutral-800">
                      <th className="text-left p-2 text-sm font-medium">Típus</th>
                      <th className="text-left p-2 text-sm font-medium">Név (Host)</th>
                      <th className="text-left p-2 text-sm font-medium">Érték</th>
                      <th className="p-2 w-[70px]">Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnsRecords.map((record, index) => (
                      <tr 
                        key={index} 
                        className={`border-b last:border-b-0 ${
                          record.type === "DKIM" ? "bg-amber-50 dark:bg-amber-900/20" : ""
                        }`}
                      >
                        <td className="p-2">
                          <Badge variant="outline" className="font-mono bg-transparent">
                            {record.recordType}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs break-all">{record.name}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-5 ml-1"
                                    onClick={() => handleCopy(record.name, `host-${record.type}-${index}`)}
                                  >
                                    {copiedField === `host-${record.type}-${index}` ? (
                                      <CheckCircle className="size-3 text-green-500" />
                                    ) : (
                                      <Copy className="size-3" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {copiedField === `host-${record.type}-${index}`
                                    ? "Másolva!"
                                    : "Host másolása"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="font-mono text-xs break-all">{record.value}</span>
                        </td>
                        <td className="p-2 text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-6"
                                  onClick={() => handleCopy(record.value, `${record.type}-${index}`)}
                                >
                                  {copiedField === `${record.type}-${index}` ? (
                                    <CheckCircle className="size-4 text-green-500" />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {copiedField === `${record.type}-${index}`
                                  ? "Másolva!"
                                  : "Érték másolása"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-md p-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Útmutató a DNS beállításhoz</h4>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>
                Lépjen be a domain regisztrációs szolgáltatója kezelőfelületére (pl. GoDaddy, Namecheap, stb.)
              </li>
              <li>
                Navigáljon a domainhez tartozó DNS kezelési felületre
              </li>
              <li>
                <strong>Adja hozzá a TXT rekordokat</strong> a domain hitelesítéshez és SPF, DMARC beállításokhoz
              </li>
              <li>
                <strong>Adja hozzá a CNAME rekordokat</strong> a DKIM hitelesítéshez (ezek a legfontosabbak)
              </li>
              <li>
                <strong>Adja hozzá az MX rekordot</strong> a visszapattanó emailek és válaszok kezeléséhez
              </li>
              <li>
                A DNS változások propagációja akár 24-48 órát is igénybe vehet
              </li>
              <li>
                A beállítások után kattintson az "Ellenőrzés" gombra a státusz frissítéséhez
              </li>
            </ol>
          </div>
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
