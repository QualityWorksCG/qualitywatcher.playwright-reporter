# QualityWatcher Reporter for Playwright

Publishes [Playwright](https://playwright.dev/) test runs on QualityWatcher.

## Install

```sh
npm install @qualitywatcher/playwright-reporter --save-dev
```

or

```sh
yarn add -D @qualitywatcher/playwright-reporter
```

## Usage

1. Add reporter to your `playwright.config.ts` configuration file:

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [
    ['@qualitywatcher/playwright-reporter', {
      projectId: 1,
      testRunName: 'Test Run Name',
      description: 'Test Run Description',
      includeAllCases: true,
      // Optional configurations
      report: true,
      complete: false,
      includeCaseWithoutId: true,
      ignoreSkipped: false,
      generateShareableLink: true,
      parentSuiteTitle: 'Smoke suite',
      uploadScreenshot: true,
      onEnd: async (testRunLink: string, shareableLink: string) => {
        // Example: Send links to Slack, email etc
        console.log('Test Run Link:', testRunLink);
        console.log('Shareable Link:', shareableLink);
     },
    }],
  ],
};

export default config;
```

2. Get API Key from QualityWatcher

   1. Go to your QualityWatcher account
   2. Hover over your profile avatar and click "Profile Settings"
   3. Select the "API Key" menu item
   4. Click the "Generate API Key" button
   5. Copy your API Key, we will use this for posting the results

3. Set your API key as an environment variable:

```sh
export QUALITYWATCHER_API_KEY=your_api_key_here
```

## Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| projectId | Yes | The ID of the project |
| testRunName | Yes | The name of the test run |
| description | Yes | A description of the test run |
| includeAllCases | Yes | Whether to include all test cases from any suite that at least one automated result belongs to |
| report | No | If false, disables the reporter without removing the configuration |
| complete | No | If true, marks the test run as complete |
| includeCaseWithoutId | No | Include test cases even if they don't have Suite and Case IDs mapping |
| ignoreSkipped | No | If true, skipped tests will be ignored |
| generateShareableLink | No | If true, generates a shareable link for the report |
| parentSuiteTitle | No | The suite where test cases without IDs will be added |
| uploadScreenshot | No | If true, uploads screenshots with the report |
| onEnd | No | Callback function that receives the test run link and shareable link after results are posted |

## Test Case Mapping

Your Playwright tests should include unique ID inside square brackets `[S14C801]` of your QualityWatcher test case:

```typescript
test('[S12C1234] should login successfully', async ({ page }) => {
  // Your test code
});
```

> If you don't have any tests in QualityWatcher you can still push your results and create new tests by enabling `includeCaseWithoutId` in your configuration.

## License

@qualitywatcher/playwright-reporter is [MIT licensed](./LICENSE).

