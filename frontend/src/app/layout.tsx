import { Header, Footer } from "@/shared/ui";
import { Roboto } from "next/font/google";
import logo from "@/assets/logo.png";
import avatar from "@/assets/mock_avatar.png";
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
        <Header
          username="Юлия"
          logo={{ image: logo }}
          avatar={{ image: avatar }}
        />
        <main className="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
