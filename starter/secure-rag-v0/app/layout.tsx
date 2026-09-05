import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Secure RAG Lab 2 fast-start",
  description: "A deliberately insecure, cited RAG baseline for the Lab 2 exercise.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
