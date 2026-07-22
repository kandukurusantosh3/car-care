# automation/pages/web_base_page.py
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class WebBasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait_timeout = 10

    def load_url(self, url):
        self.driver.get(url)

    def wait_for_element(self, locator, timeout=None):
        timeout = timeout or self.wait_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    def wait_for_element_visible(self, locator, timeout=None):
        timeout = timeout or self.wait_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def click(self, locator):
        element = self.wait_for_element_visible(locator)
        element.click()

    def type_text(self, locator, text):
        element = self.wait_for_element_visible(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        element = self.wait_for_element_visible(locator)
        return element.text
