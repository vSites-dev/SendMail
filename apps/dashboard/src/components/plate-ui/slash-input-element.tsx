"use client";

import React from "react";

import { withRef } from "@udecode/cn";
import { type PlateEditor, ParagraphPlugin } from "@udecode/plate/react";
import { AIChatPlugin, AIPlugin } from "@udecode/plate-ai/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import {
  EquationPlugin,
  InlineEquationPlugin,
} from "@udecode/plate-math/react";
import { TablePlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrdered,
  PilcrowIcon,
  Quote,
  RadicalIcon,
  SparklesIcon,
  Square,
  Table,
  TableOfContentsIcon,
} from "lucide-react";

import {
  insertBlock,
  insertInlineElement,
} from "@/components/editor/transforms";

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";
import { PlateElement } from "./plate-element";

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;

  onSelect: (editor: PlateEditor, value: string) => void;

  value: string;
  className?: string;
  focusEditor?: boolean;
  keywords?: string[];
  label?: string;
}

const groups: Group[] = [
  {
    group: "Alap blokkok",
    items: [
      {
        icon: <PilcrowIcon />,
        keywords: ["paragraph"],
        label: "Bekezdés",
        value: ParagraphPlugin.key,
      },
      {
        icon: <Heading1Icon />,
        keywords: ["title", "h1"],
        label: "1. szintű címsor",
        value: HEADING_KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        keywords: ["subtitle", "h2"],
        label: "2. szintű címsor",
        value: HEADING_KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        keywords: ["subtitle", "h3"],
        label: "3. szintű címsor",
        value: HEADING_KEYS.h3,
      },
      {
        icon: <ListIcon />,
        keywords: ["unordered", "ul", "-"],
        label: "Pontozott lista",
        value: ListStyleType.Disc,
      },
      {
        icon: <ListOrdered />,
        keywords: ["ordered", "ol", "1"],
        label: "Számozott lista",
        value: ListStyleType.Decimal,
      },
      {
        icon: <Table />,
        label: "Táblázat",
        value: TablePlugin.key,
      },
      {
        icon: <Quote />,
        keywords: ["citation", "blockquote", "quote", ">"],
        label: "Idézet",
        value: BlockquotePlugin.key,
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
        keywords: ["toc"],
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
        focusEditor: true,
        icon: <CalendarIcon />,
        keywords: ["time"],
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

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, editor, element } = props;

    return (
      <PlateElement
        ref={ref}
        as="span"
        className={className}
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox element={element} trigger="/">
          <InlineComboboxInput />

          <InlineComboboxContent>
            <InlineComboboxEmpty>Nincs találat</InlineComboboxEmpty>

            {groups.map(({ group, items }) => (
              <InlineComboboxGroup key={group}>
                <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

                {items.map(
                  ({ focusEditor, icon, keywords, label, value, onSelect }) => (
                    <InlineComboboxItem
                      key={value}
                      value={value}
                      onClick={() => onSelect(editor, value)}
                      label={label}
                      focusEditor={focusEditor}
                      group={group}
                      keywords={keywords}
                    >
                      <div className="mr-2 text-muted-foreground">{icon}</div>
                      {label ?? value}
                    </InlineComboboxItem>
                  ),
                )}
              </InlineComboboxGroup>
            ))}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  },
);
