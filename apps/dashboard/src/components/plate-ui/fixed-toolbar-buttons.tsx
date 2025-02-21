"use client";

import React, { useMemo } from "react";

import { useEditorReadOnly } from "@udecode/plate/react";
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from "@udecode/plate-font/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  VideoPlugin,
} from "@udecode/plate-media/react";
import {
  ArrowUpToLineIcon,
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  HighlighterIcon,
  ItalicIcon,
  PaintBucketIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from "lucide-react";

import { MoreDropdownMenu } from "@/components/plate-ui/more-dropdown-menu";

import { AIToolbarButton } from "./ai-toolbar-button";
import { AlignDropdownMenu } from "./align-dropdown-menu";
import { ColorDropdownMenu } from "./color-dropdown-menu";
import { CommentToolbarButton } from "./comment-toolbar-button";
import { EmojiDropdownMenu } from "./emoji-dropdown-menu";
import { ExportToolbarButton } from "./export-toolbar-button";
import { FontSizeToolbarButton } from "./font-size-toolbar-button";
import { RedoToolbarButton, UndoToolbarButton } from "./history-toolbar-button";
import { ImportToolbarButton } from "./import-toolbar-button";
import {
  BulletedIndentListToolbarButton,
  NumberedIndentListToolbarButton,
} from "./indent-list-toolbar-button";
import { IndentTodoToolbarButton } from "./indent-todo-toolbar-button";
import { IndentToolbarButton } from "./indent-toolbar-button";
import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { LineHeightDropdownMenu } from "./line-height-dropdown-menu";
import { LinkToolbarButton } from "./link-toolbar-button";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { MediaToolbarButton } from "./media-toolbar-button";
import { ModeDropdownMenu } from "./mode-dropdown-menu";
import { OutdentToolbarButton } from "./outdent-toolbar-button";
import { TableDropdownMenu } from "./table-dropdown-menu";
import { ToggleToolbarButton } from "./toggle-toolbar-button";
import { ToolbarGroup } from "./toolbar";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";
import { usePathname } from "next/navigation";

export function FixedToolbarButtons() {
  const pathname = usePathname();
  const readOnly = useEditorReadOnly();

  const isTudasbazis = useMemo(() => {
    return pathname.includes("/tudasbazis");
  }, [pathname]);

  return (
    <div className="flex w-full">
      {!readOnly && (
        <>
          <ToolbarGroup>
            <UndoToolbarButton />
            <RedoToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <ExportToolbarButton>
              <ArrowUpToLineIcon />
            </ExportToolbarButton>

            <ImportToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <InsertDropdownMenu />
            {!isTudasbazis && <TurnIntoDropdownMenu />}
            {!isTudasbazis && <FontSizeToolbarButton />}
          </ToolbarGroup>

          {!isTudasbazis && (
            <ToolbarGroup>
              <MarkToolbarButton
                nodeType={BoldPlugin.key}
                tooltip="Félkövér (Ctrl+B)"
              >
                <BoldIcon />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={ItalicPlugin.key}
                tooltip="Dőlt (Ctrl+I)"
              >
                <ItalicIcon />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={UnderlinePlugin.key}
                tooltip="Aláhúzott (Ctrl+U)"
              >
                <UnderlineIcon />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={StrikethroughPlugin.key}
                tooltip="Áthúzott (Ctrl+⇧+M)"
              >
                <StrikethroughIcon />
              </MarkToolbarButton>

              <ColorDropdownMenu
                nodeType={FontColorPlugin.key}
                tooltip="Szöveg színe"
              >
                <BaselineIcon />
              </ColorDropdownMenu>

              <ColorDropdownMenu
                nodeType={FontBackgroundColorPlugin.key}
                tooltip="Háttérszín"
              >
                <PaintBucketIcon />
              </ColorDropdownMenu>
            </ToolbarGroup>
          )}

          <ToolbarGroup>
            <AlignDropdownMenu />

            <NumberedIndentListToolbarButton />
            <BulletedIndentListToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkToolbarButton />
            <TableDropdownMenu />
            <EmojiDropdownMenu />
            <MediaToolbarButton nodeType={ImagePlugin.key} />
          </ToolbarGroup>

          {!isTudasbazis && (
            <ToolbarGroup>
              <LineHeightDropdownMenu />
              <OutdentToolbarButton />
              <IndentToolbarButton />
            </ToolbarGroup>
          )}
        </>
      )}

      <div className="grow" />

      <ToolbarGroup>
        <MarkToolbarButton nodeType={HighlightPlugin.key} tooltip="Kiemelés">
          <HighlighterIcon />
        </MarkToolbarButton>
      </ToolbarGroup>
    </div>
  );
}
