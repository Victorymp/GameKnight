import { type GameData, type Player, type Question } from "../../models/model";
import {
  connectGameSocket,
  onGameSocketMessage,
  sendGameSocketMessage,
} from "../../websocket/websocket-controller";
import {createGame as apiCreateGame, startGame as apiStartGame } from "../../api/api-controller";
import playerController from "./player-controller";
import { connectWebSocket, subscribeToUserQueue } from "../../websocket/websocket";

class GameController {
  private static instance: GameController | null = null;
  private gameData?: GameData;
  private connectionReady: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): GameController {
    if (!GameController.instance) {
      GameController.instance = new GameController();
    }
    return GameController.instance;
  }

  async createGame(gameCode?: string, questions?: Question[]): Promise<GameData | undefined> {
    if (this.gameData) return this.gameData;

    try {
      const newGame: Omit<GameData, "id" | "gameQrB64"> = {
        gameCode: gameCode ?? "",
        gameTitle: "", 
        questions: questions ?? [],
        images: []
      };

      const created = await apiCreateGame(newGame);
      this.gameData = created;

      const withPlayers = created as GameData & { players?: Player[] };
      if (withPlayers.players) {
        playerController.setPlayers(withPlayers.players);
      }
    } catch (err) {
      console.error("Failed to create game", err);
      return undefined;
    } finally {
      await this.initSocket();
    }

    return this.gameData;
  }

  async startGame(gameCode?: string, data?: Partial<GameData>): Promise<GameData | undefined> {
    if (this.gameData) return this.gameData;

    try {
      console.log(`Starting API with game code: ${gameCode}`);
      const created = await apiStartGame(gameCode ?? "");
      
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
      if (player?.id && player?.name) {
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

  async joinGame(gameCode: string, name: string): Promise<{ playerId: string; name: string }> {
    await connectWebSocket();

    return new Promise((resolve, reject) => {
      console.log("About to call subscribeToUserQueue, function is:", typeof subscribeToUserQueue);
      const off = subscribeToUserQueue("/user/queue/join", (msg) => {
        console.log("Got message on /user/queue/join:", msg);
        if (msg?.type === "join:ack" && msg?.payload?.gameCode === gameCode) {
          off();
          clearTimeout(timeoutId);
          resolve({
            playerId: msg.payload.playerId,
            name: msg.payload.name,
          });
        }
      });

      const timeoutId = setTimeout(() => {
        off();
        reject(new Error("Server didn't reply to join"));
      }, 5_000);

      // Small delay to let subscription register on server
      setTimeout(() => {
        sendGameSocketMessage(`/app/game/${gameCode}/join`, { name });
      }, 200);
    });
  }

  send(message: { destination: string; body: unknown }) {
    console.log("GameController.send()", message);
    sendGameSocketMessage(message.destination, message.body);
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

  validate(questions: Question[]): string | null {
    if (questions.length === 0) return "Add at least one question.";
    for (const q of questions) {
      if (!q.text.trim()) return "Every question needs text.";
      if (q.answers.length < 2) return "Every question needs at least 2 answers.";
      if (q.answers.some((a) => !a.text.trim())) return "Every answer needs text.";
      if (!q.answers.some((a) => a.correct)) return "Mark one correct answer per question.";
    }
    return null;
  }

reset(): void {
    this.gameData = undefined;
    playerController.clear();
    this.connectionReady = null;   // ← also reset this so a future reconnect can be awaited
  }
}

const gameController = GameController.getInstance();
export default gameController;