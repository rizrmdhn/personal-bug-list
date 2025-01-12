import { create } from "zustand";

interface DialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useDialogStore = create<DialogProps>((set) => ({
  open: true,
  setOpen: (open) => set({ open }),
}));
