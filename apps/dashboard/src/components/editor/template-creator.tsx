"use client";

import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Button } from "../ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";

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

      toast.success("A sablon sikeresen létrehozva!");
      router.push("/sablonok");
    } else {
      toast.error("Hiba történt a mentés során!");
    }

    setLoading(false);
  }

  return (
    <>
      <div className="my-3" />

      <p className="text-muted-foreground">
        A sablon létrehozásához szükséges a sablon neve és tartalma.
      </p>

      <Separator className="my-3" />

      <Card>
        <CardContent className="py-4">
          <p className="text-muted-foreground text-sm">Sablon neve: </p>
          <Input
            placeholder="Sablon neve"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <p className="text-muted-foreground text-sm mt-4">
            Sablon tartalma:{" "}
          </p>
          <div
            className="min-h-[400px] h-[calc(100vh-380px)] overflow-y-scroll w-full border bg-white rounded-md"
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
        </CardContent>
      </Card>

      <div className="flex mt-4 gap-2 justify-end">
        <Button
          onClick={() => router.back()}
          disabled={isLoading}
          variant={"outline"}
        >
          <ArrowLeft className="size-4" />
          Vissza
        </Button>

        <Button onClick={handleSave} isLoading={isLoading}>
          {!isLoading && <Save className="size-4" />}
          Létrehozás
        </Button>
      </div>
    </>
  );
}
