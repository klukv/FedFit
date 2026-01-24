/**
 * Возвращает правильную форму слова в зависимости от числа (для русского языка)
 * @param count - число
 * @param forms - массив форм [единственное, 2-4, множественное]
 * @example pluralize(1, ["минута", "минуты", "минут"]) // "минута"
 * @example pluralize(3, ["минута", "минуты", "минут"]) // "минуты"
 * @example pluralize(5, ["минута", "минуты", "минут"]) // "минут"
 */
export const pluralize = (
  count: number,
  forms: [string, string, string]
): string => {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return forms[2];
  }

  if (lastDigit === 1) {
    return forms[0];
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return forms[1];
  }

  return forms[2];
};
