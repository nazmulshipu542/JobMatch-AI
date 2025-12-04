export type Role = 'employer' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  resumeText?: string; // Extracted text from uploaded PDF
  resumeFileName?: string;
  skills?: string[];
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string; // Markdown or plain text
  requirements: string[];
  postedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'accepted';
  aiMatchScore?: number; // 0-100
  aiAnalysis?: string; // Summary from Gemini
  missingSkills?: string[];
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export interface GeminiAnalysisResult {
  matchScore: number;
  missingSkills: string[];
  analysis: string;
}