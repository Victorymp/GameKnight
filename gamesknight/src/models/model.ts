export interface UserData {

}

export interface GameQr{
  gameQrB64: string;
  // Game code is the code from the game you pick
  gameCode?: string;
}

export interface GameData extends GameQr{
  // Game id is th Id of the running game
  id: number;
  questions: Question[];
}

export interface Player{
  displayName: string;
  id: string;
}


export interface Answer {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  text: string;
  imagePreview?: string; // base64 data URL for preview/storage
  answers: Answer[];
}
