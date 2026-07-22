# automation/utils/screenshot.py
import os
import time

def capture_screenshot(driver, test_id):
    """
    Capture mobile device screenshot and store it under reports/Screenshots/ directory.
    """
    try:
        report_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        screenshot_dir = os.path.join(report_dir, "reports", "Screenshots")
        os.makedirs(screenshot_dir, exist_ok=True)
        
        file_name = f"{test_id}_{int(time.time())}.png"
        file_path = os.path.join(screenshot_dir, file_name)
        
        driver.save_screenshot(file_path)
        print(f"[SCREENSHOT] Saved failure screenshot to: {file_path}")
        return file_path
    except Exception as e:
        print(f"[ERROR] Failed to save screenshot: {e}")
        return ""
