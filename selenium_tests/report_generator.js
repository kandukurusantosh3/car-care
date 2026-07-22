const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Generates an Excel report for the Selenium end-to-end tests.
 * @param {Array<{step: string, status: string, error: string}>} testResults 
 * @param {string} outputDir 
 */
async function generateExcelReport(testResults, outputDir = __dirname) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Selenium Test Automation';
    
    const worksheet = workbook.addWorksheet('Test Execution Report');

    // Add Headers
    worksheet.columns = [
        { header: 'Test Step', key: 'step', width: 40 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Error Details', key: 'error', width: 50 }
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' } // Blue
    };

    // Add Data and Color Code Statuses
    testResults.forEach((result, index) => {
        const row = worksheet.addRow({
            step: result.step || 'Unknown Step',
            status: result.status || 'FAIL',
            error: result.error || ''
        });

        const statusCell = row.getCell('status');
        if (result.status === 'PASS') {
            statusCell.font = { color: { argb: 'FF006100' } }; // Dark Green text
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green background
        } else {
            statusCell.font = { color: { argb: 'FF9C0006' } }; // Dark Red text
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } }; // Light Red background
        }
    });

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate filename and save
    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '').split('.')[0];
    const fileName = `Selenium_Test_Report_${timestamp}.xlsx`;
    const filePath = path.join(outputDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log(`\n[SUCCESS] Excel report generated at: ${filePath}`);
    return filePath;
}

module.exports = { generateExcelReport };
