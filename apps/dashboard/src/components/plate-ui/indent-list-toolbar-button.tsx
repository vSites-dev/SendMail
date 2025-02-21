"use client";

import React from "react";

import { useEditorRef, useEditorSelector } from "@udecode/plate/react";
import {
  ListStyleType,
  someIndentList,
  toggleIndentList,
} from "@udecode/plate-indent-list";
import { List, ListOrdered } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from "./toolbar";

export function NumberedIndentListToolbarButton() {
  const editor = useEditorRef();
  const openState = useOpenState();

  const pressed = useEditorSelector(
    (editor) =>
      someIndentList(editor, [
        ListStyleType.Decimal,
        ListStyleType.LowerAlpha,
        ListStyleType.UpperAlpha,
        ListStyleType.LowerRoman,
        ListStyleType.UpperRoman,
      ]),
    [],
  );

  return (
    <ToolbarSplitButton pressed={openState.open}>
      <ToolbarSplitButtonPrimary
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        onClick={() =>
          toggleIndentList(editor, {
            listStyleType: ListStyleType.Decimal,
          })
        }
        data-state={pressed ? "on" : "off"}
        tooltip="Számozott lista"
      >
        <ListOrdered className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu {...openState} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Decimal,
                })
              }
            >
              (1, 2, 3) lista
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.LowerAlpha,
                })
              }
            >
              (a, b, c) lista
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.UpperAlpha,
                })
              }
            >
              (A, B, C) lista
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.LowerRoman,
                })
              }
            >
              (i, ii, iii) lista
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.UpperRoman,
                })
              }
            >
              (I, II, III) lista
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}

export function BulletedIndentListToolbarButton() {
  const editor = useEditorRef();
  const openState = useOpenState();

  const pressed = useEditorSelector(
    (editor) =>
      someIndentList(editor, [
        ListStyleType.Disc,
        ListStyleType.Circle,
        ListStyleType.Square,
      ]),
    [],
  );

  return (
    <ToolbarSplitButton pressed={openState.open}>
      <ToolbarSplitButtonPrimary
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        onClick={() => {
          toggleIndentList(editor, {
            listStyleType: ListStyleType.Disc,
          });
        }}
        data-state={pressed ? "on" : "off"}
        tooltip="Pontozott lista"
      >
        <List className="size-4" />
      </ToolbarSplitButtonPrimary>

      <DropdownMenu {...openState} modal={false}>
        <DropdownMenuTrigger asChild>
          <ToolbarSplitButtonSecondary />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" alignOffset={-32}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Disc,
                })
              }
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current bg-current" />
                Alap
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Circle,
                })
              }
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full border border-current" />
                Kör
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                toggleIndentList(editor, {
                  listStyleType: ListStyleType.Square,
                })
              }
            >
              <div className="flex items-center gap-2">
                <div className="size-2 border border-current bg-current" />
                Négyzet
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarSplitButton>
  );
}
