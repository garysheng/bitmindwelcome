import { Timestamp } from 'firebase/firestore';

export type Identity = 'investor' | 'developer' | 'student' | 'founder' | 'potential_partner' | 'other';

export const IDENTITIES: { value: Identity; label: string }[] = [
  { value: 'investor', label: 'Investor' },
  { value: 'developer', label: 'Developer' },
  { value: 'student', label: 'Student' },
  { value: 'founder', label: 'Founder' },
  { value: 'potential_partner', label: 'Potential Partner' },
  { value: 'other', label: 'Other' }
];

export interface AdminAnnotation {
  text?: string;
  audioUrl?: string;
  photoUrl?: string;
  createdAt: Timestamp;
  createdBy: string;
  identities?: Identity[];
}

export interface AIAnalysis {
  relevanceScore: number;
  suggestedIdentities: Identity[];
  analysis: string;
  lastAnalyzed: Timestamp;
}

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
  adminAnnotation?: AdminAnnotation;
  aiAnalysis?: AIAnalysis;
  isAnnotated: boolean;
}

// Frontend type
export interface BusinessCardSubmission extends Omit<BusinessCardSubmissionDB, 'createdAt' | 'location' | 'adminAnnotation' | 'aiAnalysis'> {
  createdAt: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  };
  adminAnnotation?: Omit<AdminAnnotation, 'createdAt'> & {
    createdAt: Date;
  };
  aiAnalysis?: Omit<AIAnalysis, 'lastAnalyzed'> & {
    lastAnalyzed: Date;
  };
}

export type FormStep = 'email' | 'name' | 'thanks';

export interface BitMindTeammate {
  id: string;
  name: string;
}

// Add more teammates as needed
export const BITMIND_TEAMMATES: BitMindTeammate[] = [
  { id: 'ken', name: 'Ken Miyachi' },
  // Add other teammates here
]; 