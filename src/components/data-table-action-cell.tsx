import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Ellipsis, LoaderCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type DefaultActionMenu = {
  icon: React.ReactNode;
  text: string;
  triggerText: string;
  className?: string;
  type: "button" | "link" | "dialog";
};

type ActionMenuButton = DefaultActionMenu & {
  type: "button";
  onClick: () => void | Promise<void>;
};

type ActionMenuLink = DefaultActionMenu & {
  type: "link";
  href: string;
};

type ActionMenuDialog = DefaultActionMenu & {
  type: "dialog";
  dialogConfig: {
    title: string;
    description: string;
    cancelText?: string;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  };
};

type ActionMenu = ActionMenuButton | ActionMenuLink | ActionMenuDialog;

type DataTableActionCellProps = {
  actionMenu: ActionMenu[];
  isLoading?: boolean;
  btnClassName?: string;
};

export default function DataTableActionCell({
  actionMenu,
  isLoading = false,
  btnClassName,
}: DataTableActionCellProps) {
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

  // Effect to close dialog when loading completes
  useEffect(() => {
    if (!isLoading) {
      setOpenDialogIndex(null);
    }
  }, [isLoading]);

  if (actionMenu.length === 0) {
    throw new Error("Action menu is empty or not provided");
  }

  async function handleDialogConfirm(menu: ActionMenuDialog) {
    await menu.dialogConfig.onConfirm();
  }

  function renderButton(menu: ActionMenu, index: number) {
    switch (menu.type) {
      case "button":
        return (
          <DropdownMenuItem
            key={index}
            onClick={async () => await menu.onClick()}
            className={cn("flex items-center gap-2", menu.className)}
          >
            {menu.icon}
            {menu.text}
          </DropdownMenuItem>
        );
      case "link":
        return (
          <DropdownMenuItem key={index} asChild>
            <Link
              href={menu.href}
              className={cn("flex items-center gap-2", menu.className)}
            >
              {menu.icon}
              {menu.text}
            </Link>
          </DropdownMenuItem>
        );
      case "dialog":
        return (
          <DropdownMenuItem
            key={index}
            onSelect={() => setOpenDialogIndex(index)}
            className={cn("flex items-center gap-2", menu.className)}
          >
            {menu.icon}
            {menu.triggerText}
          </DropdownMenuItem>
        );
    }
  }

  function renderDialog(menu: ActionMenu, index: number) {
    if (menu.type !== "dialog") return null;

    const isCurrentlyLoading = isLoading;

    return (
      <AlertDialog key={index} open={openDialogIndex === index}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{menu.dialogConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {menu.dialogConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpenDialogIndex(null)}
              disabled={isCurrentlyLoading}
            >
              {menu.dialogConfig.cancelText ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDialogConfirm(menu)}
              className={cn(btnClassName)}
              disabled={isCurrentlyLoading}
            >
              {isCurrentlyLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {menu.dialogConfig.confirmText ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={isLoading}>
          <Ellipsis className="size-4 text-black dark:text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {actionMenu.map((menu, index) => renderButton(menu, index))}
        </DropdownMenuContent>
      </DropdownMenu>
      {actionMenu.map((menu, index) => renderDialog(menu, index))}
    </>
  );
}
