const { expect } = require('chai');
const BasePage = require('../pages/BasePage');
const config = require('../config/config');
const excelReporter = require('../utilities/ExcelReporter');
const logger = require('../utilities/Logger');
const { By } = require('selenium-webdriver');

describe('UI & Navigation Tests', function() {
  let basePage;
  let startTime;

  before(async function() {
    basePage = new BasePage();
    await basePage.open();
  });

  beforeEach(async function() {
    startTime = Date.now();
    await basePage.navigateTo(config.baseUrl);
  });

  afterEach(async function() {
    const duration = Date.now() - startTime;
    const testState = this.currentTest.state; 
    
    let screenshotPath = null;
    if (testState === 'failed') {
      screenshotPath = await basePage.utils.captureScreenshot(this.currentTest.title);
    }

    excelReporter.addTestResult({
      module: 'UI Navigation',
      scenario: this.currentTest.title,
      browser: config.browser,
      status: testState === 'passed' ? 'Passed' : 'Failed',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: duration,
      error: testState === 'failed' ? this.currentTest.err.message : '',
      screenshotPath: screenshotPath,
      url: await basePage.utils.driver.getCurrentUrl()
    });

    excelReporter.addLog({
      testName: this.currentTest.title,
      step: 'Test Completed',
      result: testState === 'passed' ? 'PASS' : 'FAIL',
      remarks: testState === 'failed' ? this.currentTest.err.message : 'Success'
    });
  });

  after(async function() {
    await basePage.quit();
    await excelReporter.generateReport();
  });

  it('should verify navbar links presence', async function() {
    logger.info('Executing test: ' + this.test.title);
    const navLinks = await basePage.utils.driver.findElements(By.css('.header-nav-item'));
    expect(navLinks.length).to.be.greaterThan(0);
  });

  it('should navigate to tracking page and use browser back', async function() {
    logger.info('Executing test: ' + this.test.title);
    // Click Tracking
    await basePage.utils.click(By.xpath("//a[contains(text(), 'Track Bookings')]"));
    await basePage.utils.driver.sleep(1000);
    let url = await basePage.utils.driver.getCurrentUrl();
    expect(url).to.include('/tracking');
    
    // Browser Back
    await basePage.utils.driver.navigate().back();
    await basePage.utils.driver.sleep(1000);
    url = await basePage.utils.driver.getCurrentUrl();
    expect(url).to.equal(config.baseUrl);
  });
});
