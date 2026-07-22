# automation/pages/web_dashboard_page.py
from selenium.webdriver.common.by import By
from web_base_page import WebBasePage

class WebDashboardPage(WebBasePage):
    NAV_EXPLORE = (By.XPATH, "//a[contains(@href, 'explore')]")
    NAV_TRACKING = (By.XPATH, "//a[contains(@href, 'tracking')]")
    LOGOUT_BTN = (By.XPATH, "//button[contains(@class, 'logout')]")
    BRAND_TEXT = (By.CLASS_NAME, "header-brand")

    def __init__(self, driver):
        super().__init__(driver)

    def navigate_to_explore(self):
        self.click(self.NAV_EXPLORE)

    def navigate_to_tracking(self):
        self.click(self.NAV_TRACKING)

    def click_logout(self):
        self.click(self.LOGOUT_BTN)

    def get_brand_title(self):
        return self.get_text(self.BRAND_TEXT)
