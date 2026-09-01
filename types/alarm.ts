export interface Alarm {
  id: string;
  user_id: string;
  trigger_time: Date;
  linked_task_ids: string[];
  dismissed_at?: Date;
}
