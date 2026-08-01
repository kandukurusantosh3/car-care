const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class ExplorePage extends BasePage {
  constructor() {
    super();
    this.searchBar = By.css('input[type="text"][placeholder*="Search"]');
    this.centerCards = By.css('.center-card');
  }

  async searchCenter(query) {
    await this.utils.type(this.searchBar, query);
  }

  async getCenterCount() {
    const elements = await this.utils.driver.findElements(this.centerCards);
    return elements.length;
  }
}

module.exports = ExplorePage;
