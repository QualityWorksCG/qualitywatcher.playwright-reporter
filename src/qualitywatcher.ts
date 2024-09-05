import axios, { Axios } from 'axios';
import { bold, green, red } from 'picocolors';
import {
  QualityWatcherPayload,
  QualityWatcherResult,
  QualityWatcherReportOptions,
} from './qualitywatcher.interface';
import fs from 'fs';

export class QualityWatcherService {
  private readonly options: QualityWatcherReportOptions;
  private readonly axios: Axios;
  private readonly signedUrl: string;

  constructor(options: QualityWatcherReportOptions) {
    this.validateOptions(options);
    this.options = options;
    const apiEnvironment = process.env.QUALITYWATCHER_API_ENVIRONMENT || 'prod';
    this.signedUrl = process.env.QUALITYWATCHER_SIGNED_URL_ENDPOINT || 'https://api.qualitywatcher.com/nimble/v1/import-management/getSignedUrl-public';

    this.axios = axios.create({
      baseURL: `https://api.qualitywatcher.com/${apiEnvironment}/nimble/v1/test-runner`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.QUALITYWATCHER_API_KEY}`,
      },
    });
  }

  private validateOptions(options: QualityWatcherReportOptions) {
    const requiredFields = ['projectId', 'testRunName', 'description', 'includeAllCases'];
    const missingFields = requiredFields.filter(field => !(field in options));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!process.env.QUALITYWATCHER_API_KEY) {
      throw new Error('QUALITYWATCHER_API_KEY environment variable is missing');
    }
  }

  async createRun(results: QualityWatcherResult[]): Promise<{ link: string, shareableReportLink: string }> {
    if (this.options.uploadScreenshot) {
      results = await this.processAttachments(results);
    }

    const data: QualityWatcherPayload = {
      projectId: this.options.projectId,
      testRunName: this.options.testRunName,
      description: this.options.description,
      complete: this.options.complete || false,
      include_all_cases: this.options.includeAllCases,
      results,
      shareableReport: this.options.generateShareableLink || false,
    };

    try {
      const response = await this.axios.post('/add-automated-test-execution', data);

      console.log(`${bold(green(`✅ Test results have been posted to QualityWatcher`))}`);
      console.log(`${bold(green('👇 Check out the test result'))}`);
      console.log(`${bold(green(`${response.data.link}`))}`);

      if (response.data.shareableReportLink) {
        console.log(`${bold(green('👇 Shareable Report Link'))}`);
        console.log(`${bold(green(`${response.data.shareableReportLink}`))}`);
      }

      return response.data;
    } catch (error) {
      console.log(`${bold(red(`There was an error publishing results`))}`);
      console.error(error);
      throw error;
    }
  }

  private async processAttachments(results: QualityWatcherResult[]): Promise<QualityWatcherResult[]> {
    for (const result of results) {
      if (result.attachments && result.attachments.length > 0) {
        const attachmentUrls = await Promise.all(
          (result.attachments as Array<{ name: string; path: string; contentType: string }>).map(
            attachment => this.uploadAttachment(result, attachment)
          )
        );
        result.attachments = attachmentUrls.filter(Boolean) as string[];
      }
    }

    return results;
  }

  private async uploadAttachment(result: QualityWatcherResult, attachment: { name: string, path: string, contentType: string }): Promise<string | null> {
    try {
      const attachmentId = result.suite_id && result.test_id ? `${result.suite_id}-${result.test_id}` : '';
      const uploadName = `attachment-${attachmentId}-${Date.now()}-${attachment.name}`;

      const signedUrlResponse = await this.axios.post(this.signedUrl, {
        fileName: uploadName,
        contentType: attachment.contentType,
      });

      const { signedUrl } = signedUrlResponse.data;

      if (signedUrl) {
        const file = await fs.promises.readFile(attachment.path);
        await axios.put(signedUrl, file, {
          headers: { 'Content-Type': attachment.contentType },
        });

        return signedUrl.split('?')[0];
      }
    } catch (error) {
      console.error(`Error uploading attachment: ${error}`);
    }

    return null;
  }
}
