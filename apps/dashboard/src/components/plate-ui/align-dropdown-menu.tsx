"use client";

import React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { useEditorRef, useSelectionFragmentProp } from "@udecode/plate/react";
import { setAlign } from "@udecode/plate-alignment";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "lucide-react";

import { STRUCTURAL_TYPES } from "@/components/editor/transforms";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

const items = [
  {
    icon: AlignLeftIcon,
    value: "Balra",
  },
  {
    icon: AlignCenterIcon,
    value: "Középre",
  },
  {
    icon: AlignRightIcon,
    value: "Jobbra",
  },
  {
    icon: AlignJustifyIcon,
    value: "Sorkizárt",
  },
];

export function AlignDropdownMenu({ children, ...props }: DropdownMenuProps) {
  const editor = useEditorRef();
  const value = useSelectionFragmentProp({
    defaultValue: "start",
    getProp: (node) => node.align,
    structuralTypes: STRUCTURAL_TYPES,
  });

  const openState = useOpenState();
  const IconValue =
    items.find((item) => item.value === value)?.icon ?? AlignLeftIcon;

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Igazítás" isDropdown>
          <IconValue />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(value: any) => {
            setAlign(editor, { value: value });
            editor.tf.focus();
          }}
        >
          {items.map(({ icon: Icon, value: itemValue }) => (
            <DropdownMenuRadioItem key={itemValue} value={itemValue} hideIcon>
              <Icon />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
