# 🔧 CarCare Android Appium Automation Framework

This directory houses the enterprise-grade Appium automation framework designed for Capacitor-based hybrid Android applications.

---

## Directory Structure

```
automation/
├── config/
│   └── appium_config.py      # Appium driver capabilities and server settings
├── data/
│   └── test_cases_data.py    # Test case definitions (440 parameterized cases)
├── pages/
│   ├── base_page.py          # Common mobile interactions (click, type, wait, gestures)
│   ├── login_page.py         # Auth & Registration POM actions
│   └── dashboard_page.py     # Main application POM controls
├── utils/
│   ├── logger.py             # Custom logging formats
│   ├── reporter_excel.py     # openpyxl Excel spreadsheet generator
│   ├── reporter_html.py      # Glassmorphism HTML dashboard generator
│   └── screenshot.py         # Capture device screenshots on failures
├── tests/
│   └── test_mobile_flow.py   # Parameterized Pytest E2E execution suite
├── reports/                  # Temp storage for runtime logs
├── runners/
│   └── run_tests.py          # Pytest runner wrapper & reports consolidator
```

---

## Local Execution Guide

### Prerequisites
1. **Python 3.9+** installed and added to PATH.
2. **Node.js 18+** installed.
3. **Android Studio** & Android SDK tools configured with platform-tools added to PATH.
4. An active **Android Emulator** or connected physical device.
5. Install Appium Server globally:
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   ```

### Setup & Run
1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Build the Android application APK:
   ```bash
   npm install
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```
3. Start the Appium Server:
   ```bash
   appium --port 4723 --address 127.0.0.1
   ```
4. Run the massive automation test runner:
   ```bash
   # In project root
   $env:PYTHONPATH="."  # Windows PowerShell
   python automation/runners/run_tests.py
   ```

---

## CI/CD Execution Guide

The framework is configured to run automatically on every push and pull request to the `main` branch via the `.github/workflows/android-e2e.yml` pipeline.

### Pipeline Lifecycle
1. **Compilation**: Runs npm build and compile Gradle debug APK.
2. **Infrastructure**: Boots a macOS runner, starts Appium server, launches the Android emulator.
3. **Execution**: Executes the test suite on the emulator.
4. **Archiving**: Uploads the generated Excel spreadsheets and HTML reports, and commits them to the `gh-pages` branch for hosting.

---

## Troubleshooting Guide

### 1. Appium server connection timeouts
- Ensure the port in `automation/config/appium_config.py` matches the port your server is running on (default `4723`).
- Run `curl http://127.0.0.1:4723/status` to verify Appium is listening.

### 2. Emulator fails to start in CI
- We utilize the `macos-13` runner which has nested virtualization support for hardware acceleration. Avoid switching to `ubuntu-latest` as emulator execution without hardware acceleration will hang and timeout.

---

## Repository Configuration Guide

### Configuring GitHub Pages for Reports
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** in the left sidebar.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Set the branch to `gh-pages` and folder to `/ (root)`.
5. Click **Save**.

Your live reports will be available at:
`https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`
