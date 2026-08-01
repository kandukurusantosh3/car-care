const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const path = require('path');
const fs = require('fs');
const logger = require('./Logger');
const config = require('../config/config');

class SeleniumUtils {
  constructor() {
    this.driver = null;
  }

  async initDriver() {
    const browserName = config.browser.toLowerCase();
    const isHeadless = config.headless;
    
    let builder = new Builder().forBrowser(browserName);

    if (browserName === 'chrome') {
      const options = new chrome.Options();
      if (isHeadless) options.addArguments('--headless=new');
      options.addArguments('--disable-gpu', '--no-sandbox', '--window-size=1920,1080');
      builder.setChromeOptions(options);
    } else if (browserName === 'firefox') {
      const options = new firefox.Options();
      if (isHeadless) options.addArguments('-headless');
      builder.setFirefoxOptions(options);
    } else if (browserName === 'edge') {
      const options = new edge.Options();
      if (isHeadless) options.addArguments('--headless=new');
      builder.setEdgeOptions(options);
    }

    this.driver = await builder.build();
    await this.driver.manage().setTimeouts({ implicit: config.implicitWait });
    await this.driver.manage().window().maximize();
    logger.info(`Started ${browserName} browser${isHeadless ? ' in headless mode' : ''}.`);
    return this.driver;
  }

  async quit() {
    if (this.driver) {
      await this.driver.quit();
      logger.info('Browser closed.');
    }
  }

  async navigateTo(url) {
    logger.info(`Navigating to: ${url}`);
    await this.driver.get(url);
  }

  async findElement(locator, timeout = config.explicitWait) {
    try {
      const element = await this.driver.wait(until.elementLocated(locator), timeout);
      await this.driver.wait(until.elementIsVisible(element), timeout);
      return element;
    } catch (error) {
      logger.error(`Element not found: ${locator}`);
      throw error;
    }
  }

  async click(locator) {
    try {
      const element = await this.findElement(locator);
      await this.driver.wait(until.elementIsEnabled(element), config.explicitWait);
      // Scroll into view to avoid ElementClickInterceptedException
      await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
      await element.click();
      logger.info(`Clicked element: ${locator}`);
    } catch (error) {
      logger.error(`Failed to click element: ${locator}. Error: ${error.message}`);
      throw error;
    }
  }

  async type(locator, text) {
    try {
      const element = await this.findElement(locator);
      await element.clear();
      await element.sendKeys(text);
      logger.info(`Typed '${text}' into element: ${locator}`);
    } catch (error) {
      logger.error(`Failed to type into element: ${locator}`);
      throw error;
    }
  }

  async getText(locator) {
    try {
      const element = await this.findElement(locator);
      return await element.getText();
    } catch (error) {
      logger.error(`Failed to get text from element: ${locator}`);
      throw error;
    }
  }

  async captureScreenshot(testName) {
    if (!this.driver) return null;
    try {
      const image = await this.driver.takeScreenshot();
      const failureDir = path.join(__dirname, '..', 'reports', 'failures');
      if (!fs.existsSync(failureDir)) fs.mkdirSync(failureDir, { recursive: true });
      
      const safeTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${safeTestName}_${Date.now()}.png`;
      const filepath = path.join(failureDir, filename);
      
      fs.writeFileSync(filepath, image, 'base64');
      logger.info(`Screenshot captured: ${filepath}`);
      return filepath;
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
      return null;
    }
  }
}

module.exports = SeleniumUtils;
