"use client";

import React, { PropsWithChildren } from "react";
import Image from "next/image";
import logo from "@/assets/logo_in_auth.jpg";
import authBack from "@/assets/authBack.jpg";
import "./authLayout.css";

export interface AuthLayoutProps {
  title: string;
  /** Опциональный CSS-класс для контейнера */
  className?: string;
}

/** Общий лейаут для страниц входа и регистрации (фон + карточка с заголовком и логотипом) */
export function AuthLayout({ title, children, className = "" }: PropsWithChildren<AuthLayoutProps>) {
  return (
    <div className={`auth-layout ${className}`.trim()} role="main">
      <div className="auth-layout__bg" aria-hidden>
        <Image
          src={authBack}
          alt=""
          fill
          priority
          sizes="100vw"
          className="auth-layout__bg-image"
          quality={95}
        />
        <div className="auth-layout__bg-overlay" />
      </div>
      <div className="auth-layout__card">
        <div className="auth-layout__logo">
          <Image src={logo} alt="FedFit" width={393} height={207} priority />
        </div>
        <h1 id="auth-layout-title" className="auth-layout__title">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
