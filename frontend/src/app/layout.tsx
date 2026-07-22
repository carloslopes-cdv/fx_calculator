import * as React from "react";
import MuiProvider from "@/components/providers/MuiProvider";

export const metadata = {
  title: "Treasury FX Risk Management",
  description: "Gestão Corporativa de Risco Cambial & Hedge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
