import { Timestamp } from 'firebase/firestore';

// Backend type (Firestore)
export interface BusinessCardSubmissionDB {
  email: string;
  name?: string;
  organization?: string;
  teammateMet?: string;
  xHandle?: string;
  note?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Timestamp;
  };
  createdAt: Timestamp;
}

// Frontend type
export interface BusinessCardSubmission extends Omit<BusinessCardSubmissionDB, 'createdAt' | 'location'> {
  createdAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
}

export type FormStep = 'email' | 'name' | 'organization' | 'teammate' | 'xhandle' | 'note' | 'thanks';

export interface BitMindTeammate {
  id: string;
  name: string;
}

// Add more teammates as needed
export const BITMIND_TEAMMATES: BitMindTeammate[] = [
  { id: 'ken', name: 'Ken Miyachi' },
  // Add other teammates here
]; 