import { type Metadata } from "next";

const generateMetadata = (metadata?: Metadata) => {
  return {
    title: `${metadata?.title ?? "Bug Report"} | An issue tracking platform`,
    description:
      metadata?.description ??
      "A platform to track and manage bugs in your software projects",
    icons: metadata?.icons ?? [{ rel: "icon", url: "/favicon.ico" }],
  };
};

export default generateMetadata;
