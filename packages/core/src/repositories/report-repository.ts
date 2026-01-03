import { FullReport } from '../entities/report';

export interface IReportRepository {
  getReport(reportId: string): Promise<FullReport | null>;
  saveReport(report: FullReport): Promise<void>;
  subscribeToReport(reportId: string, callback: (report: FullReport | null) => void): () => void;
}
