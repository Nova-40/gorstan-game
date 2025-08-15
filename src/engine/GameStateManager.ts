export type RoomId = string;
export type PlayerState = {
  currentRoom: RoomId;
  objectivesCompleted: Set<string>;
  trapsTriggered: Set<string>;
};

export class GameStateManager {
  private static instance: GameStateManager;
  private playerState: PlayerState;

  private constructor() {
    this.playerState = {
      currentRoom: 'room:hub',
      objectivesCompleted: new Set(),
      trapsTriggered: new Set(),
    };
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  getPlayerState(): PlayerState {
    return this.playerState;
  }

  updateCurrentRoom(roomId: RoomId): void {
    this.playerState.currentRoom = roomId;
  }

  completeObjective(objectiveId: string): void {
    this.playerState.objectivesCompleted.add(objectiveId);
  }

  triggerTrap(trapId: string): void {
    this.playerState.trapsTriggered.add(trapId);
  }
}
