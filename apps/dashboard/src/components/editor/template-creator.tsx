"use client";

import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";

export function TemplateCreator() {
  const utils = api.useUtils();
  const router = useRouter();
  const editor = useCreateEditor();

  const [name, setName] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);

  const { mutateAsync: createTemplate } = api.template.create.useMutation();

  async function handleSave() {
    setLoading(true);

    const markdown = editor.api.markdown.serialize();

    const res = await createTemplate({
      name: name,
      body: markdown,
    });

    if (res.success) {
      utils.template.getAll.invalidate();

      toast.success("A sablon sikeresen hozzáadva!");
    } else {
      toast.error("Hiba történt a mentés során!");
    }

    setLoading(false);
  }

  return (
    <>
      <div className="my-3" />

      <Separator className="my-3" />

      <p className="text-muted-foreground -mb-4">
        Az alábbi szerkesztő segítségével hozhatod létre a sablonodat.
      </p>

      <Input
        className="my-4"
        placeholder="Sablon neve"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div
        className="min-h-[400px] h-[calc(100vh-380px)] overflow-y-scroll mt-6 w-full border bg-white rounded-md"
        data-registry="plate"
      >
        <DndProvider backend={HTML5Backend}>
          <Plate editor={editor}>
            <EditorContainer>
              <Editor variant="default" disabled={isLoading} />
            </EditorContainer>
          </Plate>
        </DndProvider>
      </div>

      <div className="flex mt-4 gap-2 justify-end">
        <Button
          onClick={() => router.back()}
          disabled={isLoading}
          variant={"outline"}
        >
          <ArrowLeft className="size-4" />
          Vissza
        </Button>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Létrehozás
        </Button>
      </div>
    </>
  );
}
