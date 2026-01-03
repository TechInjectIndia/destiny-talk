import { NumerologyReport } from '../numerology';

export interface FullReport {
  reportId: string;
  userId: string;
  numerologyData: NumerologyReport;
  fullReportMarkdown: string;
  createdAt: Date;
  version: string;
}
