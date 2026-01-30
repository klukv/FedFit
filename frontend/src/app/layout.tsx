import { Roboto } from "next/font/google";
import ConditionalLayout from "./ConditionalLayout";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={roboto.className}>
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
