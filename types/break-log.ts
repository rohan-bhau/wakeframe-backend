export interface BreakLog {
  id: string;
  activity_instance_id: string;
  start_at: Date;
  end_at?: Date;
  planned_duration: number;
  exceeded_cap: boolean;
}
