export interface Album {
  id: number;
  title: string;
  description?: string;
  tags?: string;
  isPublic: boolean;
  ownerId?: string;
  games: GameData[];
  images: Image[];
}

export interface Player{
  name: string;
  id: string;
  score: number;
  rank?: number;
}

export interface GameQr{
  gameQrB64: string;
  // Game code is the code from the game you pick
  gameCode: string;
}

export interface GameData extends GameQr {
  id: number;
  gameTitle?: string;
  questions: Question[];
  qrImageBase64?: string;
  images: Image[];
  albumId?: number;
  gameDescription?: string;
}

export interface Answer {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  images: Image[];
}

export interface Image {
  isThumbnails: boolean;
  isPrimary: boolean;
  type: string;
  category: string;
  title: string;
  content: string;
  path?: string;
  gameId?: string;
  questionId?: string;
  id?: number;
}


export interface QuestionView  { 
  id: number; 
  text: string; 
  images: Image[];
  answers: AnswerView[];
  hasImage: boolean;
}

export interface QuestionImage {
  type: string;
  content: string;
}


export interface AnswerView { 
  id: number; 
  text: string 
}

export interface PlayerQuestion {
  id: number;
  text: string;
  answers: { id: number; text: string }[];
}

export type PlayerPhase =  "waiting" | "get_ready" | "voting" | "voted" | "reveal" | "score" | "ended";

export type HostPhase = "lobby" | "get_ready" | "question" | "reveal" | "score" | "ended";