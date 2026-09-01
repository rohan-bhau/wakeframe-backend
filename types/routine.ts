export type RoutineMode = '24h' | 'custom';

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  mode: RoutineMode;
}
