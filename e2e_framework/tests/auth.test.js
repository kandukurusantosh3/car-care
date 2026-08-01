const { expect } = require('chai');
const AuthPage = require('../pages/AuthPage');
const DashboardPage = require('../pages/DashboardPage');
const config = require('../config/config');
const excelReporter = require('../utilities/ExcelReporter');
const logger = require('../utilities/Logger');

describe('Authentication Flow Tests', function() {
  let authPage;
  let dashboardPage;
  let startTime;

  before(async function() {
    authPage = new AuthPage();
    dashboardPage = new DashboardPage();
  });

  beforeEach(async function() {
    startTime = Date.now();
    await authPage.open();
    await authPage.navigateTo(`${config.baseUrl}auth`);
  });

  afterEach(async function() {
    const duration = Date.now() - startTime;
    const testState = this.currentTest.state; // 'passed' or 'failed'
    
    let screenshotPath = null;
    if (testState === 'failed') {
      screenshotPath = await authPage.utils.captureScreenshot(this.currentTest.title);
    }

    excelReporter.addTestResult({
      module: 'Authentication',
      scenario: this.currentTest.title,
      browser: config.browser,
      status: testState === 'passed' ? 'Passed' : 'Failed',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      duration: duration,
      error: testState === 'failed' ? this.currentTest.err.message : '',
      screenshotPath: screenshotPath,
      url: await authPage.utils.driver.getCurrentUrl()
    });

    excelReporter.addLog({
      testName: this.currentTest.title,
      step: 'Test Completed',
      result: testState === 'passed' ? 'PASS' : 'FAIL',
      remarks: testState === 'failed' ? this.currentTest.err.message : 'Success'
    });

    await authPage.quit();
  });

  after(async function() {
    await excelReporter.generateReport();
  });

  it('should not login with invalid credentials', async function() {
    logger.info('Executing test: ' + this.test.title);
    await authPage.login('0000000000', 'wrongpass');
    
    // Check for error message
    // Depending on actual implementation, the error might appear in DOM.
    // Assuming error-message div appears
    try {
      const errorText = await authPage.getErrorMessage();
      expect(errorText).to.include('Invalid credentials', 'Error message mismatch');
    } catch (err) {
      // If the app uses alerts instead
      try {
        await authPage.utils.driver.wait(require('selenium-webdriver').until.alertIsPresent(), 5000);
        let alert = await authPage.utils.driver.switchTo().alert();
        let alertText = await alert.getText();
        await alert.accept();
        expect(alertText.toLowerCase()).to.include('invalid');
      } catch (alertErr) {
        throw new Error('No error message or alert found on invalid login');
      }
    }
  });

  it('should login successfully with valid customer credentials', async function() {
    logger.info('Executing test: ' + this.test.title);
    await authPage.login(config.credentials.customer.phone, config.credentials.customer.password);
    
    // Verify successful login
    // Usually redirects to dashboard or changes header
    try {
      await authPage.utils.driver.wait(require('selenium-webdriver').until.urlIs(config.baseUrl), 5000);
    } catch(e) {}
    
    const url = await authPage.utils.driver.getCurrentUrl();
    expect(url).to.equal(config.baseUrl);
    
    // Check local storage for session persistence
    const user = await authPage.utils.driver.executeScript("return localStorage.getItem('user');");
    expect(user).to.be.a('string');
  });

});
