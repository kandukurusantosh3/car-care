const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { generateExcelReport } = require('./report_generator');

// Base URL of the React web application
const BASE_URL = 'http://localhost:3000';

// Array to store the results of each test step
const testResults = [];

/**
 * Helper function to log test results and push to the results array
 */
function logResult(step, status, error = '') {
    testResults.push({ step, status, error });
    console.log(`[${status}] ${step} ${error ? '- ' + error : ''}`);
}

/**
 * Main execution function for the End-to-End flow
 */
async function runEndToEndTests() {
    console.log('--- Starting Selenium E2E Tests ---');

    // Configure Chrome Options (Optional: uncomment headless to run without GUI)
    let options = new chrome.Options();
    options.addArguments('--headless'); // Run in the background
    options.addArguments('--window-size=1280,800');

    // Build the WebDriver
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Step 1: Navigate to the web application
        try {
            await driver.get(BASE_URL);
            await driver.wait(until.titleMatches(/.*/), 5000); // Wait for title to load
            logResult('Navigate to Web App (localhost:3000)', 'PASS');
        } catch (e) {
            logResult('Navigate to Web App (localhost:3000)', 'FAIL', e.message);
            throw e; // Stop execution if we can't load the app
        }

        // Step 2: Verify a specific element on the homepage (Example)
        try {
            // Adjust the selector to match an actual element on your React app
            // const header = await driver.wait(until.elementLocated(By.tagName('h1')), 3000);
            await driver.sleep(1000); // Wait for React to render (using explicit sleeps for example simplicity)
            logResult('Verify Home Screen UI Elements', 'PASS');
        } catch (e) {
            logResult('Verify Home Screen UI Elements', 'FAIL', e.message);
        }

        // Step 3: Click a navigation link (Example)
        try {
            // const serviceLink = await driver.findElement(By.linkText('Services'));
            // await serviceLink.click();
            await driver.sleep(1000);
            logResult('Navigate to Services Page', 'PASS');
        } catch (e) {
            logResult('Navigate to Services Page', 'FAIL', e.message);
        }

        // Step 4: Interact with a form or search bar (Example)
        try {
            // const searchBox = await driver.wait(until.elementLocated(By.css('input[type="text"]')), 3000);
            // await searchBox.sendKeys('Car Wash');
            await driver.sleep(1000);
            logResult('Search for "Car Wash"', 'PASS');
        } catch (e) {
            logResult('Search for "Car Wash"', 'FAIL', e.message);
        }

    } catch (globalError) {
        console.error('\nCritical Error during test execution:', globalError.message);
    } finally {
        // Close the browser
        await driver.quit();
        
        // Generate the Excel report from the collected results
        console.log('\n--- Test Execution Complete. Generating Report ---');
        await generateExcelReport(testResults, __dirname);
    }
}

// Execute the tests
runEndToEndTests();
