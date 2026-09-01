export interface InterruptionLog {
  id: string;
  activity_instance_id: string;
  reason: string;
  estimated_duration: number;
  actual_duration: number;
  resulting_reschedule: Record<string, unknown>;
}
