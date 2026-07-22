# automation/pages/base_page.py
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from appium.webdriver.common.appiumby import AppiumBy

class BasePage:
    def __init__(self, driver):
        self.driver = driver
        self.wait_timeout = 15

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

    def type(self, locator, text):
        element = self.wait_for_element_visible(locator)
        element.clear()
        element.send_keys(text)

    def get_text(self, locator):
        element = self.wait_for_element_visible(locator)
        return element.text

    def switch_to_webview(self):
        """
        Switch to the Webview context if available (standard for Capacitor/Cordova hybrid apps).
        """
        time.sleep(3)
        contexts = self.driver.contexts
        webview_context = next((c for c in contexts if 'WEBVIEW' in c), None)
        if webview_context:
            self.driver.switch_to.context(webview_context)
            return True
        return False

    def switch_to_native(self):
        self.driver.switch_to.context("NATIVE_APP")
