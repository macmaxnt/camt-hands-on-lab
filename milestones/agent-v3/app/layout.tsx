import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Agent v3 — Lab 3 milestone",
  description: "A completed bounded-agent milestone with cited RAG, security controls, and human approval.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
