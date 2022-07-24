import axios, { Axios } from 'axios';
import { bold, green, red } from 'picocolors';
import {
  QualityWatcherPayload,
  QualityWatcherResult,
} from './qualitywatcher.interface';

export class QualityWatcherService {
  private readonly apiKey: string;
  private readonly projectId: number;
  private readonly testRunName: string;
  private readonly description: string;
  private readonly includeAllCases: boolean;
  private readonly axios: Axios;

  constructor(options: QualityWatcherPayload) {
    if (!options.apiKey) {
      throw new Error('[apiKey] is missing. Please, provide it in the config');
    }
    if (!options.projectId) {
      throw new Error(
        '[projectId] is missed. Please, provide it in the config'
      );
    }
    if (!options.testRunName) {
      throw new Error(
        '[testRunName] is missed. Please, provide it in the config'
      );
    }
    if (!options.description) {
      throw new Error(
        '[description] is missed. Please, provide it in the config'
      );
    }
    if (!options.includeAllCases) {
      throw new Error(
        '[includeAllCases] is missing. Please, provide it in the config'
      );
    }

    this.apiKey = options.apiKey;
    this.projectId = options.projectId;
    this.testRunName = options.testRunName;
    this.description = options.description;
    this.includeAllCases = options.includeAllCases;

    this.axios = axios.create({
      baseURL: 'https://api.qualitywatcher.com/prod/nimble/v1/test-runner',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      ...options,
    });
  }

  async createRun(items: QualityWatcherResult[]): Promise<string> {
    const data = {
      projectId: this.projectId,
      testRunName: this.testRunName,
      description: this.description,
      includeAllCases: this.includeAllCases,
      suites: items
        .map(item => item.suite_id)
        .filter((value, index, self) => self.indexOf(value) === index),
      results: items,
    };
    try {
      const response = await this.axios.post(
        '/add-automated-test-execution',
        data
      );

      console.log(
        `${bold(green(`✅ Test results have been posted to QualityWatcher`))}`
      );
      console.log(`${bold(green('👇 Check out the test result'))}`);
      console.log(`${bold(green(`${response.data.link}`))}`);
      return response.data;
    } catch (error) {
      console.log(`${bold(red(`There was an error publishing results`))}`);
      console.log(error);
      throw new Error(`\nUnknown error: ${error}`);
    }
  }
}
