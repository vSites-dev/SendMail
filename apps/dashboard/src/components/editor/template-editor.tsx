"use client";

import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Button } from "../ui/button";
import { ArrowLeft, Save, Trash, TypeOutline } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Template } from "@prisma/client";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

export function TemplateEditor({ template }: { template?: Template }) {
  const utils = api.useUtils();
  const router = useRouter();
  const editor = useCreateEditor();

  const [isLoading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");

  useEffect(() => {
    if (template?.body) {
      editor.children = editor.api.markdown.deserialize(template?.body, {
        splitLineBreaks: true,
      });
      setName(template?.name);
    }
  }, []);

  const { mutateAsync: updateTemplate } = api.template.update.useMutation();

  const { mutateAsync: deleteTemplate } = api.template.delete.useMutation();

  async function handleDelete() {
    if (!template) {
      return;
    }

    setLoading(true);

    const res = await deleteTemplate({
      id: template.id,
    });

    if (res.success) {
      utils.template.invalidate();

      toast.success("A sablon sikeresen törölve!");
      router.push("/sablonok");
    } else {
      toast.error("Hiba történt a törlés során!");
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!name) {
      toast.error("A sablon nevének megadása szükséges!");
      return;
    }

    setLoading(true);

    const markdown = editor.api.markdown.serialize();

    const res = await updateTemplate({
      id: template!.id,
      name: name,
      body: markdown,
    });

    if (res.success) {
      utils.template.invalidate();

      toast.success("A sablon sikeresen frissítve!");
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
          <p className="text-sm">Sablon neve: </p>
          <div className="relative">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="peer ps-9"
              placeholder="Köszönjük a megkeresését!"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <TypeOutline size={16} aria-hidden="true" />
            </div>
          </div>

          <p className="text-sm mt-6">Sablon tartalma: </p>
          <div className="text-muted-foreground text-sm mb-4">
            A szövegben a következő <b>változókat</b> használhatod fel:
            <ul className="list-disc list-inside mt-1">
              <li>
                <code className="bg-muted px-1 rounded">{"{{name}}"}: </code>A
                címzett neve
              </li>
              <li>
                <code className="bg-muted px-1 rounded">{"{{email}}"}: </code>A
                címzett email címe
              </li>
            </ul>
          </div>
          <div
            className="min-h-[400px] max-h-[calc(100vh-500px)] overflow-y-scroll w-full border bg-white rounded-md"
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

        <Button
          variant="destructive"
          isLoading={isLoading}
          onClick={handleDelete}
        >
          <Trash className="size-4" />
          Törlés
        </Button>

        <Button onClick={handleSave} isLoading={isLoading}>
          {!isLoading && <Save className="size-4" />}
          Mentés
        </Button>
      </div>
    </>
  );
}
