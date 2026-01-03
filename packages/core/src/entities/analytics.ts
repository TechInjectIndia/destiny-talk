export interface AnalyticsEvent {
  id?: string;
  eventName: string;
  userId?: string;
  params: Record<string, unknown>;
  timestamp: Date;
}
