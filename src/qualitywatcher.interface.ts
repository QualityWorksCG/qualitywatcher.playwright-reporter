export enum Status {
  Passed = 'passed',
  Failed = 'failed',
  Skipped = 'skipped',
  Pending = 'pending',
}

export interface QualityWatcherResult {
  suite_id: number | undefined;
  test_id: number | undefined;
  comment: string;
  status: string;
  time: number;
  case?: {
    suiteTitle: string;
    testCaseTitle: string;
    steps: string;
  } | undefined;
  id: string;
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

export interface QualityWatcherReportOptions {
  projectId: number;
  testRunName: string;
  description: string;
  includeAllCases: boolean;
  complete: boolean;
  includeCaseWithoutId?: boolean;
  excludeSkipped?: boolean;
}
