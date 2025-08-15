import { roomObjectivesConfig } from '../data/roomObjectivesConfig';

export interface RoomObjective {
  id: string;
  description: string;
  isCompleted: boolean;
}

export class RoomObjectivesManager {
  private objectives: Record<string, RoomObjective[]> = roomObjectivesConfig;

  addObjective(roomId: string, objective: RoomObjective): void {
    if (!this.objectives[roomId]) {
      this.objectives[roomId] = [];
    }
    this.objectives[roomId].push(objective);
  }

  getObjectives(roomId: string): RoomObjective[] {
    return this.objectives[roomId] || [];
  }

  markObjectiveCompleted(roomId: string, objectiveId: string): void {
    const roomObjectives = this.objectives[roomId];
    if (roomObjectives) {
      const objective = roomObjectives.find(obj => obj.id === objectiveId);
      if (objective) {
        objective.isCompleted = true;
      }
    }
  }
}
