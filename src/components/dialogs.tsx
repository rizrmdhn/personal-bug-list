"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/stores/dialog.stores";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation"; // Updated import
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

type ModalProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

export default function Dialogs({ title, className, children }: ModalProps) {
  const open = useDialogStore((state) => state.open);
  const setOpen = useDialogStore((state) => state.setOpen);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenChange = () => {
    setOpen(false);
    setTimeout(() => {
      router.back();
      setOpen(true);
    }, 300);
  };

  // Handle mounting for SSR
  if (!mounted) {
    return null;
  }

  // Get dialog root after component is mounted
  const dialogRoot = document.getElementById("dialog-root");
  if (!dialogRoot) {
    console.error("Dialog root element not found");
    return null;
  }

  return createPortal(
    <Dialog defaultOpen={open} open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          className,
          "sm:w-[600px] sm:max-w-[650px] lg:w-[650px] xl:w-[760px]",
        )}
      >
        <DialogHeader>
          <DialogDescription>
            <VisuallyHidden>Dialog</VisuallyHidden>
          </DialogDescription>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>,
    dialogRoot,
  );
}
