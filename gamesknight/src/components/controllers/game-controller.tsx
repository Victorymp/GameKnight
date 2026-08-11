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
      onGameSocketMessage((msg) => this.handleSocketMessage(msg));
    });

    return this.connectionReady;
  }

  private handleSocketMessage(msg: any): void {
    console.debug("GameController socket message:", msg);
    if (!msg) return;

    if (typeof msg === "string") {
      try {
        msg = JSON.parse(msg);
      } catch {
        return;
      }
    }

    const payload = msg.payload ?? msg;

    if (msg.type === "game:update") {
      console.log("New Player");
      this.gameData = payload as GameData;
      const players = (payload as GameData & { players?: Player[] }).players;
      if (players) {
        playerController.setPlayers(players);
      }
      return;
    }

    if (msg.type === "player:joined" && payload) {
      const player = (payload as Player) ?? null;
      if (player?.id && player?.displayName) {
        playerController.addPlayer(player);
      }
      return;
    }

    if (payload?.players && Array.isArray(payload.players)) {
      playerController.setPlayers(payload.players as Player[]);
      if (typeof payload.gameCode === "string") {
        this.gameData = { ...(this.gameData ?? {}), ...payload } as GameData;
      }
      return;
    }

    if (Array.isArray(msg.players)) {
      playerController.setPlayers(msg.players as Player[]);
      return;
    }
  }

  async joinGame(gameCode: string,{id, displayName}:PlayerJoinProp): Promise<GameData | undefined> {
    console.log("GameController.joinGame()", { gameCode, id, displayName });
    const player = { id, displayName };
    playerController.addPlayer(player);

    if (this.gameData) {
      const currentPlayers = (this.gameData as GameData & { players?: Player[] }).players ?? [];
      this.gameData = {
        ...this.gameData,
        players: currentPlayers.some((p) => p.id === id)
          ? currentPlayers.map((p) => (p.id === id ? player : p))
          : [...currentPlayers, player],
      } as GameData;
    }

    await this.initSocket();
    console.log("Socket initialized for join");
    try {
      const joinPayload = { type: "game:join", payload: { gameCode, id, displayName } };
      console.log("Sending join event", joinPayload);
      this.send(joinPayload);
    } catch (err) {
      console.warn("Could not send join event", err);
    }

    return this.gameData;
  }


  send(message: any) {
    console.log("GameController.send()", message);
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