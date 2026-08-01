const { expect } = require('chai');
const BasePage = require('../pages/BasePage');
const DynamicTester = require('../utilities/DynamicTester');
const config = require('../config/config');
const excelReporter = require('../utilities/ExcelReporter');
const logger = require('../utilities/Logger');

describe('Dynamic Form Validation Tests', function() {
  let basePage;
  let dynamicTester;
  let startTime;

  before(async function() {
    basePage = new BasePage();
    await basePage.open();
    dynamicTester = new DynamicTester(basePage.utils);
  });

  after(async function() {
    await basePage.quit();
    await excelReporter.generateReport();
  });

  // We loop through the routes defined in config and dynamically scan them
  config.routesToScan.forEach(route => {
    describe(`Forms on route: ${route}`, function() {
      let formsOnPage = [];

      before(async function() {
        const fullUrl = config.baseUrl.replace(/\/$/, '') + (route === '/' ? '' : route);
        await basePage.navigateTo(fullUrl);
        // Wait for React to render
        await basePage.utils.driver.sleep(2000); 
        formsOnPage = await dynamicTester.scanFormsOnCurrentPage();
      });

      it(`should scan and find forms on ${route}`, async function() {
        startTime = Date.now();
        logger.info(`Found ${formsOnPage.length} forms on ${route}`);
        
        excelReporter.addTestResult({
          module: 'Dynamic Forms',
          scenario: `Scan forms on ${route}`,
          browser: config.browser,
          status: 'Passed',
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
          url: await basePage.utils.driver.getCurrentUrl()
        });
      });

      // We cannot easily generate dynamic `it` blocks *inside* a `before` hook in Mocha 
      // without using specialized dynamic suite generators. 
      // Instead, we will execute all dynamic tests inside a single 'it' block for each route.
      it(`should validate HTML5 rules for all forms on ${route}`, async function() {
        startTime = Date.now();
        let failures = [];

        for (const form of formsOnPage) {
          const testCases = dynamicTester.generateTestCasesForForm(form);
          for (const tc of testCases) {
            try {
              logger.info(`Executing dynamic test: ${tc.description}`);
              await tc.execute();
            } catch (err) {
              failures.push(`Failed: ${tc.description}. Error: ${err.message}`);
            }
          }
        }

        const testState = failures.length > 0 ? 'Failed' : 'Passed';
        let screenshotPath = null;
        if (testState === 'Failed') {
          screenshotPath = await basePage.utils.captureScreenshot(`DynamicForms_${route.replace(/\//g, '')}`);
        }

        excelReporter.addTestResult({
          module: 'Dynamic Forms',
          scenario: `Form validations on ${route}`,
          browser: config.browser,
          status: testState,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
          error: failures.join(' | '),
          screenshotPath: screenshotPath,
          url: await basePage.utils.driver.getCurrentUrl()
        });

        if (failures.length > 0) {
          throw new Error(failures.join('\n'));
        }
      });
    });
  });
});
