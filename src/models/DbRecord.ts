import { firestore } from 'firebase/app';
import 'firebase/firestore';
import { zeroTimestamp } from '../util/timestamp';

export interface DbRecord {
  id: string;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}

export function createDbRecord(initial?: Partial<DbRecord>): DbRecord {
  return {
    id: '',
    createdAt: zeroTimestamp,
    updatedAt: zeroTimestamp,
    ...initial,
  };
}

/**
 * Sets present time to `updatedAt`.
 * Also sets it to `createdAt` if zero.
 */
export function setTimestamps<T extends DbRecord>(record: T): T {
  const now = firestore.Timestamp.now();
  return {
    ...record,
    createdAt: record.createdAt === zeroTimestamp ? now : record.createdAt,
    updatedAt: now,
  };
}
