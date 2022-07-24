export enum Status {
  Passed = 'passed',
  Failed = 'failed',
  Skipped = 'skipped',
  Pending = 'pending',
}

export interface QualityWatcherResult {
  suite_id: number;
  test_id: number;
  comment: string;
  status: string;
  time: number;
  title: string;
}

export interface QualityWatcherPayload {
  apiKey: string;
  projectId: number;
  testRunName: string;
  description: string;
  includeAllCases: boolean;
  results: QualityWatcherResult[];
}

export interface QualityWatcherOptions {
  url: string;
  password: string;
  projectId: number;
}
