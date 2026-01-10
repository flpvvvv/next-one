import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Who’s next?",
  description: "A fun, interactive web app for randomly picking names with a card-shuffle roulette effect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
