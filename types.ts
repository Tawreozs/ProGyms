
export enum ExerciseType {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO'
}

export enum BlockType {
  WARMUP = 'РАЗМИНКА',
  CORE = 'ОСНОВА',
  COOLDOWN = 'ЗАМИНКА'
}

export interface Set {
  reps: number;
  weight: number;
  completed?: boolean;
}

export interface CardioStats {
  speed: number;
  time: number;
  incline: number;
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets?: Set[];
  cardio?: CardioStats;
}

export interface WorkoutBlock {
  id: string;
  type: BlockType;
  exercises: Exercise[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  blocks: WorkoutBlock[];
}

export interface ExerciseDatabaseItem {
  name: string;
  type: ExerciseType;
  category: string;
}
