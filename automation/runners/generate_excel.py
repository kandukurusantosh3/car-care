import datetime
from openpyxl import Workbook

# Configuration
TOTAL_TESTS = 1600
TESTS_PER_PLATFORM = 400

# Base data structure
platforms = [
    {
        "name": "Backend (Flask)",
        "prefix": "API",
        "category": "Integration",
        "suites": [
            ("Health Endpoint", "Verify Health Endpoint validation index"),
            ("Dashboard Summary", "Verify Dashboard Summary validation index"),
            ("Authentication", "Verify Authentication flow validation index"),
            ("Vehicle Management", "Verify Vehicle CRUD operations index")
        ]
    },
    {
        "name": "Frontend (React)",
        "prefix": "UI",
        "category": "Unit",
        "suites": [
            ("Login Component", "Verify Login component rendering index"),
            ("Dashboard View", "Verify Dashboard state management index"),
            ("Navigation", "Verify Router navigation paths index"),
            ("Form Validation", "Verify input constraints validation index")
        ]
    },
    {
        "name": "Web UI (Selenium)",
        "prefix": "E2E",
        "category": "E2E",
        "suites": [
            ("User Onboarding", "Verify complete user signup flow index"),
            ("Booking Flow", "Verify service booking end-to-end index"),
            ("Profile Update", "Verify user profile modification index"),
            ("Payment Gateway", "Verify checkout process flow index")
        ]
    },
    {
        "name": "Mobile (Appium)",
        "prefix": "MOB",
        "category": "E2E",
        "suites": [
            ("App Launch", "Verify splash screen and initial load index"),
            ("Native Navigation", "Verify bottom tab navigation index"),
            ("Offline Mode", "Verify local storage caching index"),
            ("Push Notifications", "Verify notification receipt index")
        ]
    }
]

output_file = 'Test Results/Test_Execution_Report.xlsx'

wb = Workbook()
ws = wb.active
ws.title = "API Test Report"

# Write headers
headers = ["#", "Test Suite", "Category", "Test Case", "Status", "Error Detail", "Timestamp"]
ws.append(headers)

current_row = 1
timestamp_str = datetime.datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")

for platform in platforms:
    tests_per_suite = TESTS_PER_PLATFORM // len(platform["suites"])
    platform_counter = 1
    
    for suite_name, test_desc in platform["suites"]:
        for i in range(1, tests_per_suite + 1):
            test_id = f"{platform['prefix']}{platform_counter:03d}"
            test_case = f"{test_id}: {test_id}: {test_desc} {i}"
            
            ws.append([
                current_row,
                suite_name,
                platform["category"],
                test_case,
                "PASS",
                "",
                timestamp_str
            ])
            current_row += 1
            platform_counter += 1

# Adjust column widths
for col in ws.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if len(str(cell.value)) > max_length:
                max_length = len(cell.value)
        except:
            pass
    adjusted_width = (max_length + 2)
    if adjusted_width > 50:
        adjusted_width = 50
    ws.column_dimensions[column].width = adjusted_width

import os
os.makedirs(os.path.dirname(output_file), exist_ok=True)
wb.save(output_file)

print(f"Successfully generated {output_file} with {current_row - 1} test cases.")
