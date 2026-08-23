export interface UserData {

}

export interface Player{
  displayName: string;
  id: string;
}

export interface GameQr{
  gameQrB64: string;
  // Game code is the code from the game you pick
  gameCode: string;
}

export interface GameData extends GameQr{
  // Game id is th Id of the running game
  id: number;
  questions: Question[];
  qrImageBase64?: string;
  images: Image[];
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
  category?: string;
  title: string;
  content: string;
  path?: string;
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