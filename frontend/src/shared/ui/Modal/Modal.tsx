"use client";

import { ReactNode, useEffect, useState, useCallback, useId } from "react";
import "./modal.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  ariaLabel,
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalId = useId();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Небольшая задержка для запуска анимации появления
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Ждём завершения анимации закрытия
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isVisible) return null;

  return (
    <div
      className={`modal-overlay ${isAnimating ? "modal-overlay--active" : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      id={`modal-${modalId}`}
    >
      <div
        className={`modal-content ${isAnimating ? "modal-content--active" : ""} ${className}`.trim()}
        role="document"
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
