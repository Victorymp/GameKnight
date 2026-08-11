import { type GameData, type Player } from "../../models/model";
import {
  createGame as apiCreateGame,
  connectGameSocket,
  onGameSocketMessage,
  sendGameSocketMessage,
} from "../../api/api-controller";
import playerController from "./player-controller";

interface PlayerJoinProp{
  id: string;
  displayName: string;
}

class GameController {
  private static instance: GameController | null = null;
  private gameData?: GameData;
  private wsInitialized = false;
  private connectionReady: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  async createGame(gameCode?: string, data?: Partial<GameData>): Promise<GameData | undefined> {
    if (this.gameData) return this.gameData;

    try {
      const created = await apiCreateGame(gameCode ?? "");
      this.gameData = created;
      if ((created as GameData & { players?: Player[] }).players) {
        playerController.setPlayers((created as unknown as { players: Player[] }).players);
      }
    } catch (err) {
      if (data) {
        this.gameData = { ...(data as GameData) } as GameData;
        if ((data as GameData & { players?: Player[] }).players) {
          playerController.setPlayers((data as unknown as { players: Player[] }).players);
        }
      } else {
        this.gameData = { gameQrB64: "", gameCode: gameCode } as GameData;
      }
    } finally {
      await this.initSocket();   // ← now awaited
    }

    return this.gameData;
  }

  private initSocket(path = "/ws"): Promise<void> {
    if (this.connectionReady) return this.connectionReady;
    this.wsInitialized = true;

    this.connectionReady = connectGameSocket(path).then(() => {
      onGameSocketMessage((msg) => {
        if (msg && msg.type === "game:update" && msg.payload) {
          this.gameData = msg.payload as GameData;
          if ((msg.payload as GameData & { players?: Player[] }).players) {
            playerController.setPlayers((msg.payload as unknown as { players: Player[] }).players);
          }
        }
      });
    });

    return this.connectionReady;
  }

  async joinGame(gameCode: string,{id, displayName}:PlayerJoinProp): Promise<GameData | undefined> {
    await this.initSocket();   // ← now waits for real connection before sending
    console.log(id);
    this.send({ type: "game:join", payload: { gameCode } });

    return this.gameData;
  }


  send(message: any) {
    sendGameSocketMessage(message);
  }

  addPlayer(player: Player) {
    return playerController.addPlayer(player);
  }

  addPlayers(players: Player[]) {
    return playerController.addPlayers(players);
  }

  updatePlayer(player: Player) {
    return playerController.updatePlayer(player);
  }

  removePlayer(playerId: Player["id"]) {
    return playerController.removePlayer(playerId);
  }

  getPlayers() {
    return playerController.getPlayers();
  }

  clearPlayers() {
    playerController.clear();
  }

  getGame(): GameData | undefined {
    return this.gameData;
  }

reset(): void {
    this.gameData = undefined;
    playerController.clear();
    this.wsInitialized = false;
    this.connectionReady = null;   // ← also reset this so a future reconnect can be awaited
  }
}

const gameController = GameController.getInstance();
export default gameController;