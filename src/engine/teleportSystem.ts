import { GameStateManager } from './GameStateManager';

export type RoomId = string;

export class TeleportSystem {
  private static instance: TeleportSystem;

  private constructor() {}

  static getInstance(): TeleportSystem {
    if (!TeleportSystem.instance) {
      TeleportSystem.instance = new TeleportSystem();
    }
    return TeleportSystem.instance;
  }

  teleportTo(roomId: RoomId): void {
    console.log(`Teleporting to ${roomId}`);
    this.showTeleportEffect();
    const gameStateManager = GameStateManager.getInstance();
    gameStateManager.updateCurrentRoom(roomId);
  }

  private showTeleportEffect(): void {
    const body = document.body;
    body.classList.add('teleport-effect');
    setTimeout(() => body.classList.remove('teleport-effect'), 1000);
  }
}
