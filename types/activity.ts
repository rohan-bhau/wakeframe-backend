export type ActivityState =
  | 'planned'
  | 'reminded'
  | 'in_progress'
  | 'completed'
  | 'ignored'
  | 'missed'
  | 'check_in'
  | 'break';

export interface Activity {
  id: string;
  day_plan_id?: string;
  day_cycle_id?: string;
  title: string;
  category?: string;
  start_time: Date;
  end_time?: Date;
  duration?: number;
  max_break_minutes?: number;
  is_extended: boolean;
  icon?: string;
  color?: string;
  sort_order: number;
}
