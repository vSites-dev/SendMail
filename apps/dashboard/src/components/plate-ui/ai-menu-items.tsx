"use client";

import { useEffect, useMemo } from "react";

import { type SlateEditor, NodeApi } from "@udecode/plate";
import { type PlateEditor, useEditorPlugin } from "@udecode/plate/react";
import { AIChatPlugin, AIPlugin } from "@udecode/plate-ai/react";
import { useIsSelecting } from "@udecode/plate-selection/react";
import {
  Album,
  BadgeHelp,
  Check,
  CornerUpLeft,
  FeatherIcon,
  ListEnd,
  ListMinus,
  ListPlus,
  PenLine,
  SmileIcon,
  Wand,
  X,
} from "lucide-react";

import { CommandGroup, CommandItem } from "./command";

export type EditorChatState =
  | "cursorCommand"
  | "cursorSuggestion"
  | "selectionCommand"
  | "selectionSuggestion";

export const aiChatItems = {
  accept: {
    icon: <Check />,
    label: "Elfogadás",
    value: "accept",
    onSelect: ({ editor }) => {
      editor.getTransforms(AIChatPlugin).aiChat.accept();
      editor.tf.focus({ edge: "end" });
    },
  },
  continueWrite: {
    icon: <PenLine />,
    label: "Írás folytatása",
    value: "continueWrite",
    onSelect: ({ editor }) => {
      const ancestorNode = editor.api.block({ highest: true });

      if (!ancestorNode) return;

      const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0;

      if (isEmpty) return;

      void editor.getApi(AIChatPlugin).aiChat.submit({
        mode: "insert",
        prompt: isEmpty
          ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
          : "Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.",
      });
    },
  },
  discard: {
    icon: <X />,
    label: "Mégsem",
    shortcut: "Escape",
    value: "discard",
    onSelect: ({ editor }) => {
      editor.getTransforms(AIPlugin).ai?.undo();
      editor.getApi(AIChatPlugin).aiChat.hide();
    },
  },
  emojify: {
    icon: <SmileIcon />,
    label: "Emojik behelyezése",
    value: "emojify",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Emojify",
      });
    },
  },
  fixSpelling: {
    icon: <Check />,
    label: "Nyelvezet javítása",
    value: "fixSpelling",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Fix spelling and grammar",
      });
    },
  },
  insertBelow: {
    icon: <ListEnd />,
    label: "Beszúrás alulra",
    value: "insertBelow",
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.insertBelow(aiEditor);
    },
  },
  makeLonger: {
    icon: <ListPlus />,
    label: "Szöveg hosszabbítása",
    value: "makeLonger",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Make longer",
      });
    },
  },
  makeShorter: {
    icon: <ListMinus />,
    label: "Szöveg rövidítése",
    value: "makeShorter",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Make shorter",
      });
    },
  },
  replace: {
    icon: <Check />,
    label: "Kicserélés",
    value: "replace",
    onSelect: ({ aiEditor, editor }) => {
      void editor.getTransforms(AIChatPlugin).aiChat.replaceSelection(aiEditor);
    },
  },
  simplifyLanguage: {
    icon: <FeatherIcon />,
    label: "Nyelvezet egyszerűsítése",
    value: "simplifyLanguage",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.submit({
        prompt: "Simplify the language",
      });
    },
  },
  tryAgain: {
    icon: <CornerUpLeft />,
    label: "Újra",
    value: "tryAgain",
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.reload();
    },
  },
} satisfies Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    value: string;
    component?: React.ComponentType<{ menuState: EditorChatState }>;
    filterItems?: boolean;
    items?: { label: string; value: string }[];
    shortcut?: string;
    onSelect?: ({
      aiEditor,
      editor,
    }: {
      aiEditor: SlateEditor;
      editor: PlateEditor;
    }) => void;
  }
>;

const menuStateItems: Record<
  EditorChatState,
  {
    items: (typeof aiChatItems)[keyof typeof aiChatItems][];
    heading?: string;
  }[]
> = {
  cursorCommand: [
    {
      items: [
        aiChatItems.continueWrite,
        // aiChatItems.summarize,
        // aiChatItems.explain,
      ],
    },
  ],
  cursorSuggestion: [
    {
      items: [aiChatItems.accept, aiChatItems.discard, aiChatItems.tryAgain],
    },
  ],
  selectionCommand: [
    {
      items: [
        // aiChatItems.improveWriting,
        aiChatItems.emojify,
        aiChatItems.makeLonger,
        aiChatItems.makeShorter,
        aiChatItems.fixSpelling,
        aiChatItems.simplifyLanguage,
      ],
    },
  ],
  selectionSuggestion: [
    {
      items: [
        aiChatItems.replace,
        aiChatItems.insertBelow,
        aiChatItems.discard,
        aiChatItems.tryAgain,
      ],
    },
  ],
};

export const AIMenuItems = ({
  setValue,
}: {
  setValue: (value: string) => void;
}) => {
  const { editor, useOption } = useEditorPlugin(AIChatPlugin);
  const { messages } = useOption("chat");
  const aiEditor = useOption("aiEditor")!;
  const isSelecting = useIsSelecting();

  const menuState = useMemo(() => {
    if (messages && messages.length > 0) {
      return isSelecting ? "selectionSuggestion" : "cursorSuggestion";
    }

    return isSelecting ? "selectionCommand" : "cursorCommand";
  }, [isSelecting, messages]);

  const menuGroups = useMemo(() => {
    const items = menuStateItems[menuState];

    return items;
  }, [menuState]);

  useEffect(() => {
    if (
      menuGroups.length > 0 &&
      menuGroups[0] &&
      menuGroups[0].items[0] &&
      menuGroups[0].items.length > 0
    ) {
      setValue(menuGroups[0].items[0].value);
    }
  }, [menuGroups, setValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup key={index} heading={group.heading}>
          {group.items.map((menuItem) => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({
                  aiEditor,
                  editor: editor,
                });
              }}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
};
