import { firestore } from 'firebase/app';
import 'firebase/firestore';

export type Timestamp = firestore.Timestamp;

export const zeroTimestamp = new firestore.Timestamp(0, 0);
