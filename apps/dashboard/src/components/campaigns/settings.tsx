"use client"

import * as React from "react";
import { useAtom } from "jotai";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { campaignNameAtom } from "@/store/global";

export function CampaignSettings() {
  const [name, setName] = useAtom(campaignNameAtom);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-neutral-700">
          Kampány beállítások
        </h2>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Kampány neve</Label>
              <Input
                id="campaign-name"
                placeholder="Adj nevet a kampánynak"
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Ez a név segít azonosítani a kampányt a rendszerben.
              </p>
            </div>
            {/* 
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="track-links" className="text-base">Linkek követése</Label>
                <p className="text-sm text-muted-foreground">
                  Engedélyezd a linkek követését a kampányban a jobb elemzéshez.
                </p>
              </div>
              <Switch
                id="track-links"
                checked={settings?.trackLinks || false}
                onCheckedChange={handleTrackLinksChange}
              />
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
