export interface Question {
  id: string;
  text: string;
  order: number;
  created: string;
  updated: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  mobile: string;
  resume?: string; // File URL from PocketBase
  video?: string; // Video file URL from PocketBase
  submittedAt?: string;
  created: string;
  updated: string;
}

export interface CandidateFormData {
  name: string;
  email: string;
  mobile: string;
  resume: File;
}

export interface VideoResponse {
  questionId: string;
  videoFile?: File;
  videoBlob?: Blob;
}