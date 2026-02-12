import AmplifyClient from "../components/AmplifyClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmplifyClient>{children}</AmplifyClient>
      </body>
    </html>
  );
}
