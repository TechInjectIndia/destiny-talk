import { AnalyticsEvent } from '../entities/analytics';

export interface IAnalyticsRepository {
  logEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void>;
  getEvents(limitCount?: number): Promise<AnalyticsEvent[]>;
  subscribeToEvents(limitCount: number, callback: (events: AnalyticsEvent[]) => void): () => void;
}
