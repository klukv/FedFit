import { Roboto } from "next/font/google";
import { AppToaster } from "@/shared/ui/AppToaster";
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
    <html lang="ru" className={roboto.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
