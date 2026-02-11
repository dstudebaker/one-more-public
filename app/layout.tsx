import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "One More",
  description: "What can you make with your ingredients? What if you had "One More"?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
