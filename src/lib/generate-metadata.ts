import { type Metadata } from "next";

const generateMetadata = (metadata?: Metadata) => {
  return {
    title: `${metadata?.title ?? "Bug Report"} | An bug reporting platform`,
    description:
      metadata?.description ??
      "A platform to report bugs and issues in your application",
    icons: metadata?.icons ?? [{ rel: "icon", url: "/favicon.ico" }],
  };
};

export default generateMetadata;
