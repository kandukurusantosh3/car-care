const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class AuthPage extends BasePage {
  constructor() {
    super();
    // Locators
    this.phoneInput = By.css('input[type="tel"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitBtn = By.css('button[type="submit"]');
    this.errorMsg = By.css('.error-message');
    this.toggleModeBtn = By.xpath("//button[contains(text(), 'Switch to')]");
  }

  async login(phone, password) {
    await this.utils.type(this.phoneInput, phone);
    await this.utils.type(this.passwordInput, password);
    await this.utils.click(this.submitBtn);
  }

  async getErrorMessage() {
    return await this.utils.getText(this.errorMsg);
  }

  async toggleAuthMode() {
    await this.utils.click(this.toggleModeBtn);
  }
}

module.exports = AuthPage;
