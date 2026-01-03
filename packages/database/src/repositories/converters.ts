import { Timestamp } from 'firebase/firestore';

export const toDate = (val: any): Date => {
  if (!val) return new Date(); // Or throw error? For now fallback.
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val); // seconds or ms?
  if (typeof val === 'string') return new Date(val);
  return new Date();
};

export const toTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};
