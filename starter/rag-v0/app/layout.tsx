import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Trustworthy RAG Assistant",
  description: "A local, citation-backed UNESCO education assistant"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

