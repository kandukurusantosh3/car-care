const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class DashboardPage extends BasePage {
  constructor() {
    super();
    this.logoutBtn = By.xpath("//button[contains(text(), 'Logout')]");
    this.welcomeMsg = By.css('.welcome-message');
  }

  async logout() {
    await this.utils.click(this.logoutBtn);
  }

  async getWelcomeMessage() {
    return await this.utils.getText(this.welcomeMsg);
  }
}

module.exports = DashboardPage;
