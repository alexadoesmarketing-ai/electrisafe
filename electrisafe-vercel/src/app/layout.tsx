import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ElectriSafe AI — OnLehane Electric LLC",
  description: "Electrical diagnostics grounded in NEC code and real field experience. Powered by OnLehane Electric LLC, South Windsor CT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f8fafc" }}>{children}</body>
    </html>
  );
}
