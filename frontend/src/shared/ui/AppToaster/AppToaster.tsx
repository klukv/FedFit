"use client";

import { Toaster } from "react-hot-toast";

/** Глобальный контейнер toast-уведомлений (корневой layout). */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "#373737",
          color: "#ffffff",
        },
      }}
    />
  );
}
