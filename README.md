# QualityWatcher reporter for Playwright

Publish Playwright test run on QualityWatcher

## Install

```sh
npm i -D playwright-zephyr
```

## Usage

Add reporter to your `playwright.config.ts` configuration file

With `user` and `password` options:

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [
    [
      'qw-playwright-reporter',
      {
        apiKey: 'Enter api key',
        projectId: 'Enter project id',
        testRunName: `${new Date().toLocaleDateString(
          'en-US'
        )} - automated run`,
        description: `triggered by automated run`,
        includeAllCases: "True or False",
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
