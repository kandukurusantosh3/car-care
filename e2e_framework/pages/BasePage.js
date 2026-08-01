const SeleniumUtils = require('../utilities/SeleniumUtils');

class BasePage {
  constructor() {
    this.utils = new SeleniumUtils();
  }

  async open() {
    await this.utils.initDriver();
  }

  async quit() {
    await this.utils.quit();
  }

  async navigateTo(url) {
    await this.utils.navigateTo(url);
  }
}

module.exports = BasePage;
