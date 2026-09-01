export interface DayCycle {
  id: string;
  user_id: string;
  start_at: Date;
  sleep_start_at: Date;
  sleep_end_at: Date;
  duration_hours: number;
}
