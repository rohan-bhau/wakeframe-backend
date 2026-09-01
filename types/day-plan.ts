export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface DayPlan {
  id: string;
  routine_id: string;
  weekday: Weekday;
}
