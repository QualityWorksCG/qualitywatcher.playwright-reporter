import stringify from "fast-safe-stringify";
import { QualityWatcherReportOptions } from "./qualitywatcher.interface";

const REGEX_SUITE_AND_TEST_ID = /\bS(\d+)C(\d+)\b/g;
const ansiRegex = new RegExp('[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))', 'g');

export const logger = (message: Object | string) => {
  let messageOut =
    message instanceof Object ? stringify(message) : message;
  console.log(`  ${messageOut}`);
};

export const msToTime = (ms: number) => {
  let seconds = Number((ms / 1000).toFixed(1));
  let minutes = Number((ms / (1000 * 60)).toFixed(1));
  let hours = Number((ms / (1000 * 60 * 60)).toFixed(1));
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + 's';
  else if (minutes < 60) return minutes + 'm';
  else if (hours < 24) return hours + 'h';
  else return days + 'd';
};

export const getBrowserInfo = (testResults: any) => {
  const {
    browserName,
    browserVersion,
    osName,
    osVersion,
    cypressVersion,
  } = testResults;

  return `
**Browser Info:**
-----
> ${browserName}(${browserVersion}) on ${osName}(${osVersion})
> Cypress: ${cypressVersion}`;
};

export const getSuiteAndCaseIds = (title: string) => {
  let suiteAndCaseIds;
  let suiteId;
  let caseId;
  while ((suiteAndCaseIds = REGEX_SUITE_AND_TEST_ID.exec(title)) != null) {
    suiteId = suiteAndCaseIds[1];
    caseId = suiteAndCaseIds[2];
  }
  return {
    suite_id: Number(suiteId),
    test_id: Number(caseId),
  };
}

export const validateOptions = (reporterOptions: QualityWatcherReportOptions) => {
  const missingOptions = [];
  if (!reporterOptions) {
    logger("reporterOptions is required in cypress.json");
    throw new Error("reporterOptions is required in cypress.json");
  }

  if (!reporterOptions?.projectId) {
    missingOptions.push("projectId");
  }

  if (!reporterOptions?.testRunName) {
    missingOptions.push("testRunName");
  }

  if (!reporterOptions?.description) {
    missingOptions.push("description");
  }

  if (missingOptions?.length > 0) {
    const errorMessage = `Missing property/properties on reporterOptions in playwright.config.ts: ${missingOptions.join(
      ", "
    )}`;
    logger(errorMessage);
    throw new Error(errorMessage);
  }
}

export const stripAnsi = (str: string): string => {
  return str.replace(ansiRegex, '');
}
