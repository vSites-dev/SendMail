"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { CalendarDays } from "lucide-react";
import { useAtom } from "jotai";
import { selectedIntervalAtom } from "@/store/global";

export default function IntervalSelect() {
  const [selectedInterval, setSelectedInterval] = useAtom(selectedIntervalAtom);

  return (
    <Select
      value={selectedInterval.toString()}
      onValueChange={(e) => setSelectedInterval(parseInt(e) as any)}
    >
      <SelectTrigger
        className="relative z-10 w-[156px] gap-2 rounded-lg sm:ml-auto"
        aria-label="Időszak kiválasztása"
      >
        <CalendarDays className="size-4" /> Elmúlt {selectedInterval} nap
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="7">7 nap</SelectItem>
        <SelectItem value="30">30 nap</SelectItem>
        <SelectItem value="90">90 nap</SelectItem>
        <SelectItem value="180">180 nap</SelectItem>
        <SelectItem value="365">365 nap</SelectItem>
      </SelectContent>
    </Select>
  );
}
