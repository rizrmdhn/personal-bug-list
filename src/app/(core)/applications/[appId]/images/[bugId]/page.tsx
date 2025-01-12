"use client";

import BugImagesCarousel from "./carousel";

export default function BugImagesPage() {
  return (
    <div className="flex h-full flex-col gap-4 space-y-4">
      <h1 className="text-3xl font-semibold">Bug Images</h1>
      <BugImagesCarousel />
    </div>
  );
}
