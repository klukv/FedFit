/**
 * Извлекает сообщение об ошибке из unknown (catch).
 * Улучшает типизацию и DRY в формах.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}
