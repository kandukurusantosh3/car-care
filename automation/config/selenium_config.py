# automation/config/selenium_config.py
import os

class SeleniumConfig:
    # Target URL for Selenium testing
    BASE_URL = os.environ.get("BASE_URL", "https://kandukurusantosh3.github.io/car-care/")
    
    @staticmethod
    def get_chrome_options():
        """
        Configure Chrome options for headless browser execution.
        """
        from selenium.webdriver.chrome.options import Options
        
        options = Options()
        options.add_argument('--headless') # Run headless in CI/CD and background
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1280,800')
        return options
