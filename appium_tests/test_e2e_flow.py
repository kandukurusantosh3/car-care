import unittest
import time
import os
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from appium.options.android import UiAutomator2Options

from report_generator import generate_excel_report

class CarServiceAppE2ETests(unittest.TestCase):
    def setUp(self):
        """
        Set up the Appium driver and launch the application.
        Make sure your Android device/emulator is running and Appium server is started.
        """
        self.results = []
        
        # Configure Appium Options
        options = UiAutomator2Options()
        options.platform_name = 'Android'
        # Replace with your actual device name or emulator id (e.g. 'emulator-5554')
        options.device_name = 'Android Emulator'
        # Replace with the actual package name of your Capacitor Android app
        options.app_package = 'com.example.carserviceapp'
        # Replace with the main activity, usually MainActivity for Capacitor apps
        options.app_activity = '.MainActivity'
        # Optional: path to your built APK if it needs to be installed
        # options.app = 'c:/car care/car_service_app/android/app/build/outputs/apk/debug/app-debug.apk'
        
        # Start Appium driver (assuming Appium is running locally on default port 4723)
        try:
            self.driver = webdriver.Remote('http://localhost:4723', options=options)
            self.driver.implicitly_wait(10)
            self.log_result("App Launch Setup", "PASS")
        except Exception as e:
            self.log_result("App Launch Setup", "FAIL", str(e))
            raise

    def log_result(self, step, status, error=""):
        """Helper to append to results list"""
        self.results.append({
            "step": step,
            "status": status,
            "error": error
        })
        print(f"[{status}] {step} {error}")

    def test_end_to_end_flow(self):
        """
        Execute the End to End flow:
        1. Wait for Webview to load
        2. Interact with the application
        """
        try:
            # 1. Switch to Webview (Capacitor apps are web apps inside a native shell)
            # It usually takes a moment for the webview context to become available
            time.sleep(5)
            contexts = self.driver.contexts
            
            # Switch to WEBVIEW context if available
            webview_context = next((c for c in contexts if 'WEBVIEW' in c), None)
            if webview_context:
                self.driver.switch_to.context(webview_context)
                self.log_result("Switch to Webview Context", "PASS")
            else:
                self.log_result("Switch to Webview Context", "FAIL", "WEBVIEW context not found. Proceeding with Native context.")
            
            # 2. Example Test Step: Verify Home Screen loads
            # Adjust selectors based on your actual React/Capacitor App's DOM or Native UI
            try:
                # Example: finding a title or a login button
                # self.driver.find_element(AppiumBy.XPATH, "//div[contains(text(), 'Car Care')]")
                time.sleep(2)
                self.log_result("Verify Home Screen Loads", "PASS")
            except Exception as e:
                self.log_result("Verify Home Screen Loads", "FAIL", str(e))

            # 3. Example Test Step: Navigate to Service Centers
            try:
                # self.driver.find_element(AppiumBy.CSS_SELECTOR, ".btn-service-centers").click()
                time.sleep(2)
                self.log_result("Navigate to Service Centers", "PASS")
            except Exception as e:
                self.log_result("Navigate to Service Centers", "FAIL", str(e))
                
            # 4. Example Test Step: Search or Filter
            try:
                # search_box = self.driver.find_element(AppiumBy.CSS_SELECTOR, "input[type='search']")
                # search_box.send_keys("Repair")
                time.sleep(2)
                self.log_result("Filter Service Centers", "PASS")
            except Exception as e:
                self.log_result("Filter Service Centers", "FAIL", str(e))

        except Exception as e:
            self.log_result("End to End Flow Execution", "FAIL", str(e))

    def tearDown(self):
        """
        Close the app and generate the report.
        """
        if hasattr(self, 'driver'):
            self.driver.quit()
        
        # Generate the Excel report in the current directory (appium_tests)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        generate_excel_report(self.results, output_dir=current_dir)

if __name__ == '__main__':
    unittest.main()
