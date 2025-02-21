"use client";

import React from "react";

import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { TTableElement } from "@udecode/plate-table";

import { PopoverAnchor } from "@radix-ui/react-popover";
import { cn, withRef } from "@udecode/cn";
import {
  useEditorPlugin,
  useEditorRef,
  useEditorSelector,
  useElement,
  useReadOnly,
  useRemoveNodeButton,
  useSelected,
  withHOC,
} from "@udecode/plate/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import {
  TablePlugin,
  TableProvider,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableMergeState,
} from "@udecode/plate-table/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CombineIcon,
  Grid2X2Icon,
  SquareSplitHorizontalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { PlateElement } from "./plate-element";
import { Popover, PopoverContent } from "./popover";
import {
  BorderAll,
  BorderBottom,
  BorderLeft,
  BorderNone,
  BorderRight,
  BorderTop,
} from "./table-icons";
import { Toolbar, ToolbarButton, ToolbarGroup } from "./toolbar";

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const readOnly = useReadOnly();
    const isSelectionAreaVisible = props.editor.useOption(
      BlockSelectionPlugin,
      "isSelectionAreaVisible",
    );
    const hasControls = !readOnly && !isSelectionAreaVisible;
    const selected = useSelected();
    const {
      isSelectingCell,
      marginLeft,
      props: tableProps,
    } = useTableElement();

    const content = (
      <PlateElement
        className={cn(
          className,
          "overflow-x-auto py-5",
          hasControls && "-ml-2",
        )}
        style={{ paddingLeft: marginLeft }}
        blockSelectionClassName={cn(hasControls && "left-2")}
        {...props}
      >
        <div className="group/table relative w-fit">
          <table
            ref={ref}
            className={cn(
              "ml-px mr-0 table h-px table-fixed border-collapse",
              isSelectingCell && "selection:bg-transparent",
            )}
            {...tableProps}
          >
            <tbody className="min-w-full">{children}</tbody>
          </table>
        </div>
      </PlateElement>
    );

    if (readOnly || !selected) {
      return content;
    }

    return <TableFloatingToolbar>{content}</TableFloatingToolbar>;
  }),
);

export const TableFloatingToolbar = withRef<typeof PopoverContent>(
  ({ children, ...props }, ref) => {
    const { tf } = useEditorPlugin(TablePlugin);
    const element = useElement<TTableElement>();
    const { props: buttonProps } = useRemoveNodeButton({ element });
    const collapsed = useEditorSelector(
      (editor) => !editor.api.isExpanded(),
      [],
    );

    const { canMerge, canSplit } = useTableMergeState();

    return (
      <Popover open={canMerge || canSplit || collapsed} modal={false}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        <PopoverContent
          ref={ref}
          asChild
          onOpenAutoFocus={(e) => e.preventDefault()}
          contentEditable={false}
          {...props}
        >
          <Toolbar
            className="flex w-auto max-w-[80vw] flex-row overflow-x-auto rounded-md border bg-popover p-1 shadow-md scrollbar-hide print:hidden"
            contentEditable={false}
          >
            <ToolbarGroup>
              {canMerge && (
                <ToolbarButton
                  onClick={() => tf.table.merge()}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Cellák egyesítése"
                >
                  <CombineIcon />
                </ToolbarButton>
              )}
              {canSplit && (
                <ToolbarButton
                  onClick={() => tf.table.split()}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Cella felosztása"
                >
                  <SquareSplitHorizontalIcon />
                </ToolbarButton>
              )}

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <ToolbarButton tooltip="Cella szegélyek">
                    <Grid2X2Icon />
                  </ToolbarButton>
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <TableBordersDropdownMenuContent />
                </DropdownMenuPortal>
              </DropdownMenu>

              {collapsed && (
                <ToolbarGroup>
                  <ToolbarButton tooltip="Táblázat törlése" {...buttonProps}>
                    <Trash2Icon />
                  </ToolbarButton>
                </ToolbarGroup>
              )}
            </ToolbarGroup>

            {collapsed && (
              <ToolbarGroup>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableRow({ before: true });
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Sor beszúrása felülre"
                >
                  <ArrowUp />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableRow();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Sor beszúrása alulra"
                >
                  <ArrowDown />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.remove.tableRow();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Sor törlése"
                >
                  <XIcon />
                </ToolbarButton>
              </ToolbarGroup>
            )}

            {collapsed && (
              <ToolbarGroup>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableColumn({ before: true });
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Oszlop beszúrása felülre"
                >
                  <ArrowLeft />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.insert.tableColumn();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Oszlop beszúrása alulra"
                >
                  <ArrowRight />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    tf.remove.tableColumn();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  tooltip="Oszlop törlése"
                >
                  <XIcon />
                </ToolbarButton>
              </ToolbarGroup>
            )}
          </Toolbar>
        </PopoverContent>
      </Popover>
    );
  },
);

export const TableBordersDropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>((props, ref) => {
  const editor = useEditorRef();
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      ref={ref}
      className={cn("min-w-[220px]")}
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        editor.tf.focus();
      }}
      align="start"
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasTopBorder}
          onCheckedChange={getOnSelectTableBorder("top")}
        >
          <BorderTop />
          <div>Felső szegély</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasRightBorder}
          onCheckedChange={getOnSelectTableBorder("right")}
        >
          <BorderRight />
          <div>Jobb szegély</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasBottomBorder}
          onCheckedChange={getOnSelectTableBorder("bottom")}
        >
          <BorderBottom />
          <div>Alsó szegély</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasLeftBorder}
          onCheckedChange={getOnSelectTableBorder("left")}
        >
          <BorderLeft />
          <div>Bal szegély</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <DropdownMenuCheckboxItem
          checked={hasNoBorders}
          onCheckedChange={getOnSelectTableBorder("none")}
        >
          <BorderNone />
          <div>Nincs szegély</div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={hasOuterBorders}
          onCheckedChange={getOnSelectTableBorder("outer")}
        >
          <BorderAll />
          <div>Külső szegély</div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
});
