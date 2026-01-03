import { IReportRepository, FullReport } from '@destiny-ai/core';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../client';
import { toDate } from './converters';

export class FirebaseReportRepository implements IReportRepository {
  async getReport(reportId: string): Promise<FullReport | null> {
    const snap = await getDoc(doc(db, 'reports', reportId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      reportId: snap.id,
      ...data,
      createdAt: toDate(data.createdAt)
    } as FullReport;
  }

  async saveReport(report: FullReport): Promise<void> {
    // reportId is usually passed or generated. 
    // In current app it's passed as 'rep_' + uid
    await setDoc(doc(db, 'reports', report.reportId), {
      ...report,
      createdAt: report.createdAt ? report.createdAt : serverTimestamp() 
      // If createdAt is Date, Firestore converts it automatically if not using serverTimestamp
      // But for consistency we might want serverTimestamp on creation.
      // However, if we pass a specific date, we use it.
    });
  }

  subscribeToReport(reportId: string, callback: (report: FullReport | null) => void): () => void {
    return onSnapshot(
      doc(db, 'reports', reportId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            reportId: snap.id,
            ...data,
            createdAt: toDate(data.createdAt)
          } as FullReport);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('Report snapshot error:', error);
        callback(null);
      }
    );
  }
}
