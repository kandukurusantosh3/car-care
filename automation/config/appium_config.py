import os

class AppiumConfig:
    # Port on which the Appium Server is running
    PORT = int(os.environ.get("APPIUM_PORT", 4723))
    HOST = os.environ.get("APPIUM_HOST", "http://localhost")
    
    @staticmethod
    def get_server_url():
        return f"{AppiumConfig.HOST}:{AppiumConfig.PORT}"

    @staticmethod
    def get_capabilities():
        """
        Get driver options capabilities for Android E2E execution.
        """
        from appium.options.android import UiAutomator2Options
        
        options = UiAutomator2Options()
        options.platform_name = 'Android'
        
        # dynamic setup for CI vs Local execution
        options.device_name = os.environ.get("ANDROID_DEVICE_NAME", "Android Emulator")
        options.automation_name = 'UiAutomator2'
        options.app_package = os.environ.get("APP_PACKAGE", "com.carcare.app")
        options.app_activity = os.environ.get("APP_ACTIVITY", ".MainActivity")
        options.no_reset = False
        options.full_reset = False
        
        # If running in CI, point to the built APK location directly
        apk_path = os.environ.get("APK_PATH")
        if apk_path and os.path.exists(apk_path):
            options.app = apk_path
            
        return options
