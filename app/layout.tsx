import "./globals.css";
import type { Metadata } from "next";
import AmplifyClient from "../components/AmplifyClient";

export const metadata: Metadata = {
  title: "One More",
  description: "one more, but that's it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AmplifyClient>{children}</AmplifyClient>
      </body>
    </html>
  );
}
