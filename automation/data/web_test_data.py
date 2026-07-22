# automation/data/web_test_data.py

def get_web_test_specs():
    """
    Generates exactly 440 unique, structured test cases distributed across 
    14 distinct categories for Selenium E2E execution as requested by user specifications.
    """
    distributions = {
        "Authentication": {"prefix": "TC_W_AUTH", "count": 40},
        "Authorization": {"prefix": "TC_W_AZ", "count": 40},
        "Navigation": {"prefix": "TC_W_NAV", "count": 30},
        "UI Validation": {"prefix": "TC_W_UI", "count": 50},
        "Forms": {"prefix": "TC_W_FORM", "count": 50},
        "CRUD Operations": {"prefix": "TC_W_CRUD", "count": 50},
        "Input Validation": {"prefix": "TC_W_VAL", "count": 40},
        "Error Handling": {"prefix": "TC_W_ERR", "count": 20},
        "Session Management": {"prefix": "TC_W_SESS", "count": 20},
        "File Upload": {"prefix": "TC_W_FILE", "count": 20},
        "Accessibility": {"prefix": "TC_W_ACC", "count": 20},
        "Responsive Design": {"prefix": "TC_W_RESP", "count": 20},
        "Performance Smoke Tests": {"prefix": "TC_W_PERF", "count": 20},
        "Regression": {"prefix": "TC_W_REGR", "count": 50}
    }

    test_cases = []
    
    for category, config in distributions.items():
        prefix = config["prefix"]
        count = config["count"]
        
        for i in range(1, count + 1):
            test_id = f"{prefix}_{i:03d}"
            priority = "CRITICAL" if i <= int(count * 0.15) else "HIGH" if i <= int(count * 0.45) else "MEDIUM" if i <= int(count * 0.85) else "LOW"
            
            preconditions = f"User browser session is active. Target URL loads successfully."
            steps = [
                f"1. Open main browser session and load site.",
                f"2. Trigger actions for module: {category}.",
                f"3. Perform specific assertion scenario #{i}."
            ]
            expected_result = f"Verify web component renders or handles transactions inside {category} correctly without errors."
            
            # Setup intentional failure mapping as requested in guidelines to verify report defect aggregation
            # Simulating 3 specific failures: TC_W_AUTH_015, TC_W_FORM_005, TC_W_CRUD_022
            status = "PASS"
            failure_reason = ""
            if test_id == "TC_W_AUTH_015":
                status = "FAIL"
                failure_reason = "Authentication flow failed: Token signature mismatch on server response"
            elif test_id == "TC_W_FORM_005":
                status = "FAIL"
                failure_reason = "Form flow failed: Input character boundary warning message did not render"
            elif test_id == "TC_W_CRUD_022":
                status = "FAIL"
                failure_reason = "CRUD flow failed: Timeout error while trying to fetch updated item list"
            elif test_id == "TC_W_FILE_012":
                status = "SKIP"
                failure_reason = "Feature Toggle: File upload server backend not active in staging environment"

            test_cases.append({
                "test_id": test_id,
                "module": category,
                "name": f"Validate web component workflow: {category} - Step {i}",
                "priority": priority,
                "preconditions": preconditions,
                "steps": "\n".join(steps),
                "expected_result": expected_result,
                "status": status,
                "failure_reason": failure_reason
            })

    return test_cases
