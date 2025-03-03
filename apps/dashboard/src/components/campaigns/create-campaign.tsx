"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CampaignModal } from "./modal";
import { SquarePlus } from "lucide-react";

export default function CreateCampaignButton() {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <SquarePlus className="size-5" />
        Új kampány létrehozása
      </Button>

      <CampaignModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}
