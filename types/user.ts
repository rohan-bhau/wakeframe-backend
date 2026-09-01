export type TrackingMode = '24h' | 'custom';

export interface User {
  id: string;
  timezone: string;
  notification_preferences: Record<string, boolean>;
  default_break_duration: number;
  tracking_mode: TrackingMode;
}
