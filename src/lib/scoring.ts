import { Mail, PlayerAnswer } from "@/types";

export function calculateScore(
  isCorrect: boolean,
  timeInSeconds: number
): number {
  if (!isCorrect) return 0;
  const timeBonus = Math.max(0, 50 - timeInSeconds * 5);
  return Math.round(100 + timeBonus);
}

export function calculateTotalScore(
  answers: PlayerAnswer[],
  mails: Mail[]
): { score: number; correctAnswers: number } {
  let score = 0;
  let correctAnswers = 0;

  for (const answer of answers) {
    const mail = mails.find((m) => m.id === answer.mailId);
    if (!mail) continue;

    const isCorrect =
      (mail.isPhishing && answer.answer === "phishing") ||
      (!mail.isPhishing && answer.answer === "legitimate");

    if (isCorrect) {
      correctAnswers++;
    }

    score += calculateScore(isCorrect, answer.timeInSeconds);
  }

  return { score, correctAnswers };
}
