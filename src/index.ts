import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import {
  QualityWatcherPayload,
  QualityWatcherReportOptions,
  QualityWatcherResult,
} from './qualitywatcher.interface';
import { QualityWatcherService } from './qualitywatcher.service';
import { getSuiteAndCaseIds, validateOptions, stripAnsi } from './util';

class QualityWatcherReport implements Reporter {
  private qualitywatcherService!: QualityWatcherService;
  private readonly options: QualityWatcherReportOptions & QualityWatcherPayload;
  private readonly results: QualityWatcherResult[] = [];

  constructor(options: QualityWatcherReportOptions & QualityWatcherPayload) {
    this.options = options;
  }
  onBegin() {
    validateOptions(this.options);
    this.qualitywatcherService = new QualityWatcherService(this.options);
  }

  onTestEnd(test: TestCase & { id: string }, result: TestResult) {
    if (this.options.excludeSkipped && result.status === 'skipped') {
      return;
    }

    const { suite_id, test_id } = getSuiteAndCaseIds(test.title);
    const resultObject: QualityWatcherResult = {
      id: test.id,
      comment: result.error?.message
        ? `${stripAnsi(result.error?.message)} \n ${stripAnsi(
            result.error?.stack || ''
          )}`
        : `${test.title} \n > ${test.location.file.split('/').pop()}:${
            test.location.line
          }:${test.location.column}`,
      status: result.status === 'timedOut' ? 'failed' : result.status,
      time: result.duration,
      suite_id: suite_id || undefined,
      test_id: test_id || undefined,
      case:
        suite_id || (test_id && this.options?.includeCaseWithoutId)
          ? undefined
          : {
              suiteTitle: test.parent.title,
              testCaseTitle: test.title,
              steps: '',
            },
    };
    // To prevent duplicates from retries
    const found = this.results.find(element => element.id === test.id);

    if (found) {
      found.status = resultObject.status;
      found.comment = resultObject.comment;
    } else {
      this.results.push(resultObject);
    }
  }

  async onEnd() {
    if (this.results.length > 0) {
      await this.qualitywatcherService.createRun(
        this.results,
        this.options.complete || false
      );
    } else {
      console.log(
        `There are no tests to post to QualityWatcher. Please, check your tests.`
      );
    }
    console.log(
      '# of passed tests',
      this.results.filter(item => item.status === 'passed').length
    );
    console.log(
      '# of failed tests',
      this.results.filter(item => item.status === 'failed').length
    );
    console.log(
      '# of skipped tests',
      this.results.filter(item => item.status === 'skipped').length
    );
  }
}

export default QualityWatcherReport;
