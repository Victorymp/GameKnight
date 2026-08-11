import type { Player } from "../../models/model";

class PlayerController {
  private static instance: PlayerController | null = null;
  private players: Player[] = [];
  private listeners: Set<(players: Player[]) => void> = new Set();

  private constructor() {}

  static getInstance(): PlayerController {
    if (!PlayerController.instance) {
      PlayerController.instance = new PlayerController();
    }
    return PlayerController.instance;
  }

  private notify(): void {
    const snapshot = this.getPlayers();
    this.listeners.forEach((cb) => cb(snapshot));
  }

  subscribe(callback: (players: Player[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getPlayers()); // fire immediately with current state
    return () => this.listeners.delete(callback);
  }

  addPlayer(player: Player): Player[] {
    const index = this.players.findIndex((p) => p.id === player.id);
    if (index >= 0) {
      this.players[index] = player;
    } else {
      this.players.push(player);
    }
    this.notify();
    return this.getPlayers();
  }

  addPlayers(players: Player[]): Player[] {
    players.forEach((player) => {
      const index = this.players.findIndex((p) => p.id === player.id);
      if (index >= 0) {
        this.players[index] = player;
      } else {
        this.players.push(player);
      }
    });
    this.notify();
    return this.getPlayers();
  }

  updatePlayer(player: Player): Player | undefined {
    const index = this.players.findIndex((p) => p.id === player.id);
    if (index < 0) return undefined;
    this.players[index] = player;
    this.notify();
    return this.players[index];
  }

  removePlayer(playerId: Player["id"]): Player[] {
    this.players = this.players.filter((p) => p.id !== playerId);
    this.notify();
    return this.getPlayers();
  }

  getPlayerById(playerId: Player["id"]): Player | undefined {
    return this.players.find((p) => p.id === playerId);
  }

  getPlayers(): Player[] {
    return [...this.players];
  }

  setPlayers(players: Player[]): void {
    this.players = [...players];
    this.notify();
  }

  clear(): void {
    this.players = [];
    this.notify();
  }

  getCount(): number {
    return this.players.length;
  }
}

const playerController = PlayerController.getInstance();
export default playerController;