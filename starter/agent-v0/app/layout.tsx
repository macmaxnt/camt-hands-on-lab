import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Agent v0 — Lab 3 fast-start",
  description: "A completed secure-RAG v2 baseline and bounded-agent backlog for Lab 3.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
