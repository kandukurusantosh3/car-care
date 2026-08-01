const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./Logger');

class ExcelReporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.reportPath = path.join(__dirname, '..', 'reports', 'E2E_Report.xlsx');
    
    // Create Sheets
    this.summarySheet = this.workbook.addWorksheet('Summary');
    this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
    this.failedTestsSheet = this.workbook.addWorksheet('Failed Tests');
    this.logsSheet = this.workbook.addWorksheet('Execution Logs');

    this.setupHeaders();
    
    // Stats tracking
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      startTime: Date.now()
    };
  }

  setupHeaders() {
    this.summarySheet.columns = [
      { header: 'Execution Date', key: 'date', width: 20 },
      { header: 'Environment', key: 'env', width: 25 },
      { header: 'Total Tests', key: 'total', width: 15 },
      { header: 'Passed', key: 'passed', width: 15 },
      { header: 'Failed', key: 'failed', width: 15 },
      { header: 'Skipped', key: 'skipped', width: 15 },
      { header: 'Pass Percentage', key: 'passPercent', width: 20 },
      { header: 'Execution Duration (s)', key: 'duration', width: 25 }
    ];
    this.summarySheet.getRow(1).font = { bold: true };

    this.testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 10 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Scenario Name', key: 'scenario', width: 40 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 20 },
      { header: 'End Time', key: 'endTime', width: 20 },
      { header: 'Duration (ms)', key: 'duration', width: 15 }
    ];
    this.testCasesSheet.getRow(1).font = { bold: true };

    this.failedTestsSheet.columns = [
      { header: 'Test Name', key: 'name', width: 40 },
      { header: 'Failure Reason', key: 'reason', width: 60 },
      { header: 'Screenshot Path', key: 'screenshot', width: 50 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'URL', key: 'url', width: 40 }
    ];
    this.failedTestsSheet.getRow(1).font = { bold: true };

    this.logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step Description', key: 'step', width: 50 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];
    this.logsSheet.getRow(1).font = { bold: true };
  }

  addTestResult(testData) {
    this.stats.total++;
    if (testData.status === 'Passed') this.stats.passed++;
    else if (testData.status === 'Failed') this.stats.failed++;
    else this.stats.skipped++;

    this.testCasesSheet.addRow({
      id: this.stats.total,
      module: testData.module || 'General',
      scenario: testData.scenario,
      browser: testData.browser || 'chrome',
      status: testData.status,
      startTime: testData.startTime,
      endTime: testData.endTime,
      duration: testData.duration
    });

    if (testData.status === 'Failed') {
      this.failedTestsSheet.addRow({
        name: testData.scenario,
        reason: testData.error,
        screenshot: testData.screenshotPath,
        browser: testData.browser || 'chrome',
        url: testData.url
      });
    }
  }

  addLog(logData) {
    this.logsSheet.addRow({
      timestamp: new Date().toISOString(),
      testName: logData.testName,
      step: logData.step,
      result: logData.result,
      remarks: logData.remarks
    });
  }

  async generateReport() {
    try {
      const endTime = Date.now();
      const durationSeconds = ((endTime - this.stats.startTime) / 1000).toFixed(2);
      const passPercent = this.stats.total > 0 ? ((this.stats.passed / this.stats.total) * 100).toFixed(2) + '%' : '0%';

      this.summarySheet.addRow({
        date: new Date().toISOString().split('T')[0],
        env: process.env.BASE_URL || 'PROD',
        total: this.stats.total,
        passed: this.stats.passed,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        passPercent: passPercent,
        duration: durationSeconds
      });

      const dir = path.dirname(this.reportPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      await this.workbook.xlsx.writeFile(this.reportPath);
      logger.info(`Excel report generated successfully at: ${this.reportPath}`);
    } catch (err) {
      logger.error('Failed to generate Excel report: ' + err.message);
    }
  }
}

// Export as singleton to be shared across tests
module.exports = new ExcelReporter();
