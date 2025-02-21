"use client";

import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";

export function DocumentEditor({
  documentId,
  content,
}: {
  documentId: string;
  content?: string;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const editor = useCreateEditor();

  const [isLoading, setLoading] = React.useState(false);

  useEffect(() => {
    if (content) editor.tf.setValue(editor.api.markdown.deserialize(content));
  }, [content]);

  async function handleSave() {
    setLoading(true);

    const markdown = editor.api.markdown.serialize();

    const res = await fetch("https://api.leoai.hu/workflows/retrain-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId,
        newContent: markdown,
      }),
    });

    if (res.status === 200) {
      utils.document.getById.invalidate({ id: documentId });
      utils.document.getDocuments.invalidate();

      toast.success("A dokumentum sikeresen frissítve!");
    } else {
      toast.error("Hiba történt a mentés során!");
    }

    setLoading(false);
  }

  return (
    <>
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
          Mentés
        </Button>
      </div>
    </>
  );
}
