"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/shared/ui";
import { ROUTES } from "@/shared/constants";
import logo from "@/assets/logo.png";
import avatar from "@/assets/mock_avatar.png";

const AUTH_PATHS: readonly string[] = [ROUTES.login, ROUTES.register];

export default function ConditionalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header
        username="Юлия"
        logo={{ image: logo }}
        avatar={{ image: avatar }}
      />
      <main className="content">{children}</main>
      <Footer />
    </>
  );
}
