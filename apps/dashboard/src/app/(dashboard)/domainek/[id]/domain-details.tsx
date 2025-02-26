"use client";

import { Globe, Copy, CheckCircle, ArrowUpRightFromSquare } from "lucide-react";
import { useState } from "react";
import { Domain } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardContent,
  CardSeparator,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn, domainStatuses } from "@/lib/utils";

export function DomainDetails({ domain }: { domain: Domain }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
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

        <h1 className={cn("text-3xl font-semibold text-neutral-700")}>
          {domain.name}
        </h1>
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
          <h2 className="text-lg font-semibold mb-2 text-neutral-700">
            DNS Bejegyzések
          </h2>

          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Típus</th>
                  <th className="p-3 text-left text-sm font-medium">
                    Host / Név
                  </th>
                  <th className="p-3 text-left text-sm font-medium">Érték</th>
                  <th className="p-3 text-left text-sm font-medium">TTL</th>
                </tr>
              </thead>
              <tbody>
                {domain.dkimTokens.map((token, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">TXT</td>
                    <td className="p-3">dkim{index + 1}</td>
                    <td className="group relative p-3">
                      <span className="mr-8 break-all">{token}</span>
                      <button
                        onClick={() => handleCopy(token, `dkim${index}`)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {copiedField === `dkim${index}` ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">Auto</td>
                  </tr>
                ))}
                {domain.spfRecord && (
                  <tr className="border-t">
                    <td className="p-3">TXT</td>
                    <td className="p-3">@</td>
                    <td className="group relative p-3">
                      <span className="mr-8 break-all">{domain.spfRecord}</span>
                      <button
                        onClick={() =>
                          handleCopy(domain.spfRecord ?? "", "spf")
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {copiedField === "spf" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">Auto</td>
                  </tr>
                )}
                {domain.dmarcRecord && (
                  <tr className="border-t">
                    <td className="p-3">TXT</td>
                    <td className="p-3">_dmarc</td>
                    <td className="group relative p-3">
                      <span className="mr-8 break-all">
                        {domain.dmarcRecord}
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(domain.dmarcRecord ?? "", "dmarc")
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        {copiedField === "dmarc" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="p-3">Auto</td>
                  </tr>
                )}
              </tbody>
            </table>
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
