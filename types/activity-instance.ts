import type { ActivityState } from './activity';

export interface ActivityInstance {
  id: string;
  activity_id: string;
  date: Date;
  day_cycle_id?: string;
  state: ActivityState;
  reminded_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  ignored_at?: Date;
}
