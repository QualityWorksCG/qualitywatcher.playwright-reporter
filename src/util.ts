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
