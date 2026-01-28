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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="theme-color" content="#1a1a2e" />
      </head>
      <body className="antialiased touch-manipulation">
        {children}
      </body>
    </html>
  );
}
