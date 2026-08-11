export interface UserData {

}

export interface GameQr{
  gameQrB64: string;
  // Game code is the code from the game you pick
  gameCode?: string;
}

export interface GameData extends GameQr{
  // Game id is th Id of the running game
  gameId?: string;
}

export interface Player{
  displayName: string;
  id: string;
}

