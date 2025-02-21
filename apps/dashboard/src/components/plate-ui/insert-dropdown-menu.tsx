"use client";

import React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import {
  type PlateEditor,
  ParagraphPlugin,
  useEditorRef,
} from "@udecode/plate/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { ExcalidrawPlugin } from "@udecode/plate-excalidraw/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import { LinkPlugin } from "@udecode/plate-link/react";
import {
  EquationPlugin,
  InlineEquationPlugin,
} from "@udecode/plate-math/react";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { TablePlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from "lucide-react";

import {
  insertBlock,
  insertInlineElement,
} from "@/components/editor/transforms";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;
  onSelect: (editor: PlateEditor, value: string) => void;
  value: string;
  focusEditor?: boolean;
  label?: string;
}

const groups: Group[] = [
  {
    group: "Alap blokkok",
    items: [
      {
        icon: <PilcrowIcon />,
        label: "Bekezdés",
        value: ParagraphPlugin.key,
      },
      {
        icon: <Heading1Icon />,
        label: "1. szintű címsor",
        value: HEADING_KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        label: "2. szintű címsor",
        value: HEADING_KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        label: "3. szintű címsor",
        value: HEADING_KEYS.h3,
      },
      {
        icon: <TableIcon />,
        label: "Táblázat",
        value: TablePlugin.key,
      },
      {
        icon: <QuoteIcon />,
        label: "Idézet",
        value: BlockquotePlugin.key,
      },
      {
        icon: <MinusIcon />,
        label: "Elválasztó",
        value: HorizontalRulePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Listák",
    items: [
      {
        icon: <ListIcon />,
        label: "Pontozott lista",
        value: ListStyleType.Disc,
      },
      {
        icon: <ListOrderedIcon />,
        label: "Számozott lista",
        value: ListStyleType.Decimal,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Média",
    items: [
      {
        icon: <ImageIcon />,
        label: "Kép",
        value: ImagePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Komplex blokkok",
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: "Tartalomjegyzék",
        value: TocPlugin.key,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: "Egyenlet",
        value: EquationPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Soron belüli elemek",
    items: [
      {
        icon: <Link2Icon />,
        label: "Hivatkozás",
        value: LinkPlugin.key,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: "Dátum",
        value: DatePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Beszúrás" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <DropdownMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
