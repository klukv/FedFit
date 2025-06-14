"use client";

import { Button, ContainerSection } from "@/shared/ui";
import { useEffect } from "react";

import "./error.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ContainerSection
      title="Что-то пошло не так!"
      placement="center"
      styles={{ height: "100%" }}
    >
      <Button onClickHandler={() => reset()} title="Попробуйте снова" />
    </ContainerSection>
  );
}
