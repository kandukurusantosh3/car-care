# automation/pages/login_page.py
from appium.webdriver.common.appiumby import AppiumBy
from base_page import BasePage

class LoginPage(BasePage):
    # Element Locators
    LOGIN_BUTTON = (AppiumBy.XPATH, "//button[contains(text(), 'Login') or contains(@class, 'login')]")
    EMAIL_INPUT = (AppiumBy.XPATH, "//input[@type='email']")
    PASSWORD_INPUT = (AppiumBy.XPATH, "//input[@type='password']")
    ERROR_LABEL = (AppiumBy.XPATH, "//div[contains(@class, 'error-message')]")
    REGISTER_LINK = (AppiumBy.XPATH, "//a[contains(text(), 'Register') or contains(@href, 'auth')]")

    def __init__(self, driver):
        super().__init__(driver)

    def perform_login(self, email, password):
        self.type(self.EMAIL_INPUT, email)
        self.type(self.PASSWORD_INPUT, password)
        self.click(self.LOGIN_BUTTON)

    def navigate_to_register(self):
        self.click(self.REGISTER_LINK)

    def get_error_message(self):
        return self.get_text(self.ERROR_LABEL)
