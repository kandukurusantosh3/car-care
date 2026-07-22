# automation/pages/web_login_page.py
from selenium.webdriver.common.by import By
from web_base_page import WebBasePage

class WebLoginPage(WebBasePage):
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_BOX = (By.CLASS_NAME, "error-message")

    def __init__(self, driver):
        super().__init__(driver)

    def login(self, email, password):
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.SUBMIT_BUTTON)

    def get_error_message(self):
        return self.get_text(self.ERROR_BOX)
