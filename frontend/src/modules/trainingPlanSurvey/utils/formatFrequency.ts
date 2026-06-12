/** Склонение «N тренировок в неделю». */
export function formatFrequencyLabel(frequency: number): string {
  const mod10 = frequency % 10;
  const mod100 = frequency % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return `${frequency} тренировок в неделю`;
  }

  if (mod10 === 1) {
    return `${frequency} тренировка в неделю`;
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return `${frequency} тренировки в неделю`;
  }

  return `${frequency} тренировок в неделю`;
}
