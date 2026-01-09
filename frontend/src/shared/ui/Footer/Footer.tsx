"use client";

import React from "react";
import { Montserrat } from "next/font/google";
import clsx from "clsx";
import "./footer.css";

const montserrat = Montserrat({
  subsets: ["latin"],
});

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner container__app">
        <div className="footer__line"></div>
        <div className={clsx("footer__text", montserrat.className)}>
          FedFits — твой умный наставник в мире спорта!
        </div>
      </div>
    </footer>
  );
};

export default Footer;

