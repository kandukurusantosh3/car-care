# Selenium Node.js E2E Framework

This directory contains the production-ready End-to-End (E2E) test automation framework for the CarCare application.

## Technology Stack
- **Node.js & JS (ES6+)**
- **Selenium WebDriver**
- **Mocha** (Test Runner)
- **Chai** (Assertion Library)
- **ExcelJS** (Excel Reporting)
- **Mochawesome** (HTML Reporting)
- **Winston** (Logging)

## Features
- **Page Object Model (POM)**: Found in `pages/`.
- **Dynamic Form Testing**: The `utilities/DynamicTester.js` will scan the application's React routes and automatically generate test cases based on HTML5 validation attributes (required, pattern, email, minLength).
- **Comprehensive Reporting**: Generates `E2E_Report.xlsx` with Summary, Test Cases, Failed Tests, and Execution Logs. Also generates a Mochawesome HTML report.
- **Robust Locators & Waits**: Wraps standard Selenium calls with explicit waits and auto-scrolling to prevent flaky tests (`utilities/SeleniumUtils.js`).
- **Failure Handling**: Automatically captures screenshots of failures and logs them.

## Setup
1. Ensure Node.js is installed (v16+).
2. Install dependencies: `npm install` (from the project root).
3. (Optional) Create or modify `config/.env` to override defaults (e.g., `HEADLESS=false` to watch tests run).

## Execution

Run all E2E tests:
```bash
npm run test:e2e
```

## Reports
After execution, reports are saved to `e2e_framework/reports/`:
- `E2E_Report.xlsx`: Detailed multi-sheet excel report.
- `e2e-report.html`: Visual HTML report.
- `failures/`: Screenshots of any failed tests.
- `logs/execution.log`: Detailed Winston framework logs.

## CI/CD
This framework is fully integrated with GitHub Actions. It runs automatically on Push or Pull Request to the `main` branch, running cross-browser tests in headless mode, and uploads all reports as build artifacts.
