export interface Person {
  id: string;
  name: string;
  picked: boolean;
}

export type GamePhase = 'setup' | 'playing' | 'spinning' | 'winner' | 'finished';

export interface GameState {
  phase: GamePhase;
  people: Person[];
  pickedOrder: Person[];
  currentWinner: Person | null;
}

export interface CardPosition {
  x: number;
  y: number;
  rotation: number;
}
