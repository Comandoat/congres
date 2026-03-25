export interface Mail {
  id: number;
  image: string;
  isPhishing: boolean;
  hint: string;
  explanation: string;
}

export interface PlayerAnswer {
  mailId: number;
  answer: "phishing" | "legitimate";
  timeInSeconds: number;
}

export interface ScoreEntry {
  id: string;
  player_name: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  created_at: string;
}

export interface GameState {
  playerName: string;
  currentMailIndex: number;
  answers: PlayerAnswer[];
  startTime: number | null;
}
