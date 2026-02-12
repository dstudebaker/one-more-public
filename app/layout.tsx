import "./globals.css";
import type { Metadata } from "next";
import InventoryHydrator from "../components/InventoryHydrator";

export const metadata: Metadata = {
  title: "One More",
  description: "Classic whiskey-bar cocktail inventory + recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <InventoryHydrator />
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
