export interface TVRow {
  id: number;
  piece: string;
  startTime: string;
  endTime: string;
  show: string;
  transcript: string;
  treatment: string;
  actionTaken: string;
}

export interface SiteRow {
  id: number;
  title: string;
  url: string;
  timestamp: string;
  giveMeRec: string;
  auditStatus?: 'GO' | 'HOLD' | 'NO' | '';
  actionTaken: string;
}

export type AlternateInputType = 'Story Pitch' | 'URL' | 'Image Upload' | 'PDF Upload';

export interface AnalysisStatus {
  state: 'IDLE' | 'ANALYZING' | 'COMPLETE' | 'ERROR';
  message?: string;
}

// Output Types
export interface PlatformOutput {
  platform: string;
  postCopy: string;
  score: number;
}

export interface YouTubeOutput {
  title: string;
  description: string;
  thumbnailText: string;
}

export interface ImageCopy {
  headline: string;
  subtext: string;
  bullets?: string[];
}

export interface StoryTreatment {
  angle: string;
  followUpSuggestions: string;
}

export interface AnalysisResult {
  platforms: {
    X: PlatformOutput;
    FacebookInstagram: PlatformOutput;
    LinkedIn: PlatformOutput;
    WhatsApp: PlatformOutput;
    Telegram: PlatformOutput;
    YouTube?: YouTubeOutput;
  };
  imageCopy: ImageCopy;
  storyTreatment: StoryTreatment;
  jacketText: string;
  followUpContentAllPlatforms: string;
}

// Legacy stub types (used by orphaned components - kept for build compatibility)
export interface ScoreDimension {
  dimension: string;
  score: number;
}

export interface PlatformStrategy {
  platform: string;
  postCopy: string;
  platformVerdict: 'GO' | 'HOLD' | 'NO';
  platformFitScore: number;
  publishingReason: string;
  notes: string;
  angle: string;
}
