import BugImagesCarousel from "@/app/(core)/applications/[appId]/images/[bugId]/carousel";
import Dialogs from "@/components/dialogs";
import React from "react";

export default function ImageModal() {
  return (
    <Dialogs title="Bug Images">
      <div className="flex h-full flex-col gap-4 space-y-4">
        <h1 className="text-3xl font-semibold">Bug Images</h1>
        <BugImagesCarousel />
      </div>
    </Dialogs>
  );
}
