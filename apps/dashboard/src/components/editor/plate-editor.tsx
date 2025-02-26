"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { SettingsDialog } from "@/components/editor/settings";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { cn } from "@/lib/utils";
import { Mail, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <div className="max-w-4xl mx-auto space-y-2 mt-6">
          <div className="flex gap-3 items-center">
            <div
              className={cn(
                "flex relative p-[5px] items-center justify-center rounded-md bg-neutral-50 text-2xl font-semibold border text-violet-600",
              )}
            >
              <Mail className="size-5" />
            </div>

            <h1 className="text-3xl font-semibold text-neutral-700">
              Email sablon készítés
            </h1>
          </div>

          <p className="text-muted-foreground">
            A sablonokat használhatja később fel kontaktok értesítésére. Ezeket
            a sablonokat lehet hozzárendelni{" "}
            <b>
              manuális küldéshez, kampányokhoz vagy automatizált eseményekhez.
            </b>
          </p>

          <div className="border bg-white rounded-md mt-2 h-[600px]">
            <EditorContainer>
              <Editor variant="demo" />
            </EditorContainer>
          </div>

          <Button className="float-right">
            <PlusCircle className="size-4" />
            Sablon létrehozása
          </Button>
        </div>

        {/* <SettingsDialog /> */}
      </Plate>
    </DndProvider>
  );
}
