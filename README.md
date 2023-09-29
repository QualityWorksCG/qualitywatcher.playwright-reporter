# QualityWatcher reporter for Playwright

Publish Playwright test run on QualityWatcher

## Install

```sh
npm i @qualitywatcher/playwright-reporter
```

## Usage

Add reporter to your `playwright.config.ts` configuration file

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [
    [
      '@qualitywatcher/playwright-reporter',
      {
        apiKey: 'Enter api key',
        projectId: 'Enter project id',
        testRunName: `${new Date().toLocaleDateString(
          'en-US'
        )} - automated run`,
        description: `triggered by automated run`,
        includeAllCases: true, // true/false
        complete: true, // optional - mark test run as completed to lock results
        includeCaseWithoutId: true, // optional - store results without mapping suite and case IDs
        excludeSkipped: false, // optional - whether or not to track skipped results
      },
    ],
  ],
};

Also, your playwright tests should include unique ID inside square brackets `[S14C801]` of your QualityWatcher test case:


## License

playwright-qualitywatcher is [MIT licensed](./LICENSE).

## Author

Nyran Moodie <nyranmoodie@gmail.com>
```
