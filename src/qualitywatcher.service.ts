import axios, { Axios } from 'axios';
import { bold, green, red } from 'picocolors';
import {
  QualityWatcherPayload,
  QualityWatcherResult,
} from './qualitywatcher.interface';

export class QualityWatcherService {
  private readonly options!: QualityWatcherPayload;
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
    if ("includeAllCases" in options && typeof options.includeAllCases !== "boolean") {
      throw new Error(
        '[includeAllCases] is missing. Please, provide it in the config'
      );
    }

    this.options = options;



    this.axios = axios.create({
      baseURL: 'https://api.qualitywatcher.com/dev/nimble/v1/test-runner',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      ...options,
    });
  }

  async createRun(results: QualityWatcherResult[]): Promise<string> {
    const data = {
      projectId: this.options.projectId,
      testRunName: this.options.testRunName,
      description: this.options.description,
      "include_all_cases": this.options.includeAllCases,
      suites: Array.from(new Set(
        results.map((result) => result.suite_id).filter(Boolean)
      )),
      results,
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
