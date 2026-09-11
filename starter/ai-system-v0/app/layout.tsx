import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "AI System v0 — Lab 4 fast-start",
  description: "The completed agent-v3 product plus a static Lab 4 system-readiness backlog.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
