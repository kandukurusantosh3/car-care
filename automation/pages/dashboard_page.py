# automation/pages/dashboard_page.py
from appium.webdriver.common.appiumby import AppiumBy
from base_page import BasePage

class DashboardPage(BasePage):
    # Element Locators
    EXPLORE_LINK = (AppiumBy.XPATH, "//a[contains(text(), 'Explore') or contains(@href, 'explore')]")
    TRACKING_LINK = (AppiumBy.XPATH, "//a[contains(text(), 'Track') or contains(@href, 'tracking')]")
    LOGOUT_BUTTON = (AppiumBy.XPATH, "//button[contains(text(), 'Logout') or contains(@class, 'logout')]")
    WELCOME_HEADER = (AppiumBy.XPATH, "//h1[contains(text(), 'Welcome')]")

    def __init__(self, driver):
        super().__init__(driver)

    def go_to_explore(self):
        self.click(self.EXPLORE_LINK)

    def go_to_tracking(self):
        self.click(self.TRACKING_LINK)

    def perform_logout(self):
        self.click(self.LOGOUT_BUTTON)

    def get_welcome_text(self):
        return self.get_text(self.WELCOME_HEADER)
