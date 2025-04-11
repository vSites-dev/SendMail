"use client";

import { Loader2 } from "lucide-react";
import { useLinkStatus } from "next/link";

export default function LinkStatus() {
  const { pending } = useLinkStatus();

  return pending && <Loader2 className="ml-auto h-4 w-4 animate-spin" />;
}
