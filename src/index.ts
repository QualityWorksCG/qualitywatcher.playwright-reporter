import { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import {
  QualityWatcherReportOptions,
  QualityWatcherResult,
} from './qualitywatcher.interface';
import { QualityWatcherService } from './qualitywatcher';
import { getSuiteAndCaseIds, validateOptions, stripAnsi } from './util';
import fs from 'fs';
import path from 'path';
import crypto from "crypto"

class QualityWatcherReporter implements Reporter {
  private qualitywatcherService!: QualityWatcherService;
  private readonly options: QualityWatcherReportOptions;
  private readonly results: QualityWatcherResult[] = [];
  private tempAttachmentDir: string;

  constructor(options: QualityWatcherReportOptions) {
    this.options = options;
    this.tempAttachmentDir = path.join(process.cwd(), 'temp_attachments');
  }

  onBegin() {
    validateOptions(this.options);
    this.qualitywatcherService = new QualityWatcherService(this.options);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempAttachmentDir)) {
      fs.mkdirSync(this.tempAttachmentDir, { recursive: true });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.options.ignoreSkipped && result.status === 'skipped') {
      return;
    }

    const { suite_id, test_id } = getSuiteAndCaseIds(test.title);
    
    const resultObject: QualityWatcherResult = {
      id: crypto.randomUUID(),
      comment: this.formatComment(test, result),
      status: result.status === 'timedOut' ? 'failed' : result.status,
      time: result.duration,
      suite_id: suite_id || undefined,
      test_id: test_id || undefined,
      case:
        suite_id || (test_id && this.options.includeCaseWithoutId)
          ? undefined
          : {
            suiteTitle: this.options.parentSuiteTitle || test.parent?.title || '',
            testCaseTitle: test.title,
            steps: this.getSteps(result.steps),
          },
      attachments: this.getAttachments(result.attachments),
    };

    const found = this.results.find(element => element.id === resultObject.id);

    if (found) {
      found.status = resultObject.status;
      found.comment = resultObject.comment;
      found.attachments = resultObject.attachments;
    } else {
      this.results.push(resultObject);
    }
  }

  private formatComment(test: TestCase, result: TestResult): string {
    const location = test.location ? 
      `${test.location.file}:${test.location.line}:${test.location.column}` : 
      'Location not available';

    const stepsSection = result.steps.map(step => {
      const status = step.error ? '❌' : '✅';
      return `${status} ${step.category}: ${step.title}`;
    }).join('\n');

    if (result.error) {
      return `<pre>
Steps:
${stepsSection}

Test:     ${test.title}
Location: ${location}
Status:   Failed
Duration: ${result.duration}ms

Error: ${stripAnsi(result?.error?.message || JSON.stringify(result?.errors.join('\n')))}

Stack Trace:
${stripAnsi(result.error.stack || '')}
</pre>`;
    }

    return `<pre>
Steps:
${stepsSection}

Test:     ${test.title}
Location: ${location}
Status:   ${result.status}
Duration: ${result.duration}ms

</pre>`;
  }

  private getSteps(steps: TestStep[]): string {
    const stepsText = steps.map(step => 
      `${step.category}: ${step.title}`
    ).join('\n');

    return `<pre>${stepsText}</pre>`;
  }

  private getAttachments(attachments: { name: string, path?: string, body?: Buffer, contentType: string }[]): { name: string, path: string, contentType: string }[] {
    return attachments
      .filter(attachment => attachment.path || attachment.body)
      .map(attachment => ({
        name: attachment.name,
        path: attachment.path || this.saveAttachmentToFile(attachment),
        contentType: attachment.contentType,
      }));
  }

  private saveAttachmentToFile(attachment: { name: string, body?: Buffer, contentType: string }): string {
    if (!attachment.body) return '';

    const filePath = path.join(this.tempAttachmentDir, `${Date.now()}-${attachment.name}`);
    fs.writeFileSync(filePath, attachment.body);
    return filePath;
  }

  async onEnd() {
    if (this.options.report !== false && this.results.length > 0) {
      const { link, shareableReportLink } = await this.qualitywatcherService.createRun(this.results);

      // Call the onEnd callback if provided
      if (this.options.onEnd && typeof this.options.onEnd === 'function') {
        await this.options.onEnd(link, shareableReportLink);
      }

    } else if (this.results.length === 0) {
      console.log('There are no tests to post to QualityWatcher. Please, check your tests.');
    } else {
      console.log('Skipping QualityWatcher report as "report" option is set to false.');
    }

    console.log('# of passed tests', this.results.filter(item => item.status === 'passed').length);
    console.log('# of failed tests', this.results.filter(item => item.status === 'failed').length);

    // Clean up temporary attachments
    this.cleanupTempAttachments();
  }

  private cleanupTempAttachments() {
    if (fs.existsSync(this.tempAttachmentDir)) {
      fs.readdirSync(this.tempAttachmentDir).forEach((file) => {
        const filePath = path.join(this.tempAttachmentDir, file);
        fs.unlinkSync(filePath);
      });
      fs.rmdirSync(this.tempAttachmentDir);
      console.log('Temporary attachments cleaned up.');
    }
  }
}

export default QualityWatcherReporter;
