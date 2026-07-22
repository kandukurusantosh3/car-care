# automation/utils/web_reporter_html.py
import os
import time

def generate_web_html_reports(results, output_dir, target_url=""):
    """
    Generates premium execution-report.html and dashboard.html dashboards
    presenting Selenium Web E2E execution metrics.
    """
    os.makedirs(output_dir, exist_ok=True)

    # Count statistics
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    skipped = sum(1 for r in results if r["status"] == "SKIP")
    pass_pct = round((passed / max(1, total)) * 100, 1)
    
    # Calculate duration
    total_duration_ms = sum(r.get("duration_ms", 35) for r in results)
    duration_str = f"{round(total_duration_ms / 1000, 2)}s"

    # Prepare modules summary
    module_stats = {}
    for r in results:
        mod = r["module"]
        if mod not in module_stats:
            module_stats[mod] = {"total": 0, "pass": 0, "fail": 0}
        module_stats[mod]["total"] += 1
        if r["status"] == "PASS":
            module_stats[mod]["pass"] += 1
        elif r["status"] == "FAIL":
            module_stats[mod]["fail"] += 1

    # Formulate Module Status Rows HTML
    module_rows_html = ""
    for mod, stats in module_stats.items():
        rate = round((stats["pass"] / max(1, stats["total"])) * 100, 1)
        module_rows_html += f"""
        <tr>
            <td style="text-align: left; padding: 12px; font-weight: 500;">{mod}</td>
            <td>{stats["total"]}</td>
            <td style="color: #00ffcc; font-weight: 600;">{stats["pass"]}</td>
            <td style="color: #ff5e57; font-weight: 600;">{stats["fail"]}</td>
            <td>
                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; overflow: hidden; height: 10px; width: 100px; display: inline-block; vertical-align: middle;">
                    <div style="background: #00ffcc; height: 100%; width: {rate}%;"></div>
                </div>
                <span style="font-size: 11px; margin-left: 6px;">{rate}%</span>
            </td>
        </tr>
        """

    # Formulate Detailed Test Case Rows HTML
    case_rows_html = ""
    for r in results:
        status = r["status"]
        badge_style = "background: rgba(0, 255, 204, 0.15); color: #00ffcc;" if status == "PASS" else \
                      "background: rgba(255, 94, 87, 0.15); color: #ff5e57;" if status == "FAIL" else \
                      "background: rgba(255, 234, 167, 0.15); color: #ffeaa7;"
        
        err_col = f"<span class='text-error'>{r.get('error', '')}</span>" if r.get('error') else "-"
        
        case_rows_html += f"""
        <tr class="test-row" data-status="{status}">
            <td style="font-weight: 600; color: #00d2d3;">{r['test_id']}</td>
            <td style="text-align: left;">{r['module']}</td>
            <td style="text-align: left;">{r['name']}</td>
            <td><span style="font-size: 11px; font-weight:600; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05);">{r['priority']}</span></td>
            <td><span class="status-badge" style="{badge_style}">{status}</span></td>
            <td>{r.get('duration_ms', 35)}ms</td>
            <td style="text-align: left; font-family: monospace; font-size: 11px;">{err_col}</td>
        </tr>
        """

    # HSL-styled Dark Mode Dashboard (Teal/Cyan accents for Web)
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Web Selenium E2E Automation Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        body {{
            font-family: 'Outfit', sans-serif;
            background: linear-gradient(135deg, #07191d 0%, #0c333a 100%);
            color: #e6f0f2;
            min-height: 100vh;
            padding: 30px;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }}
        .brand {{
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(90deg, #00ffcc, #00d2d3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .meta-info {{
            font-size: 14px;
            color: #8fa0a3;
        }}
        .grid-kpis {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        .card-kpi {{
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }}
        .card-kpi:hover {{
            transform: translateY(-4px);
            box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.3);
        }}
        .card-kpi .label {{
            font-size: 14px;
            color: #8fa0a3;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .card-kpi .value {{
            font-size: 32px;
            font-weight: 700;
        }}
        .dashboard-content {{
            display: grid;
            grid-template-columns: 3fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }}
        @media(max-width: 1024px) {{
            .dashboard-content {{
                grid-template-columns: 1fr;
            }}
        }}
        .card-glass {{
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }}
        .card-title {{
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #e2e8f0;
            border-left: 4px solid #00ffcc;
            padding-left: 10px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            text-align: center;
        }}
        th {{
            background: rgba(255, 255, 255, 0.04);
            color: #8fa0a3;
            font-weight: 600;
            padding: 12px;
            text-transform: uppercase;
            font-size: 12px;
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            vertical-align: middle;
        }}
        .status-badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }}
        .text-error {{
            color: #ff5e57;
        }}
        .device-info-list {{
            list-style: none;
        }}
        .device-info-list li {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.03);
            font-size: 14px;
        }}
        .device-info-list li span:first-child {{
            color: #8fa0a3;
        }}
        .device-info-list li span:last-child {{
            font-weight: 600;
        }}
        .controls-filter {{
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }}
        .btn-filter {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e6f0f2;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 600;
            transition: background 0.2s;
        }}
        .btn-filter:hover, .btn-filter.active {{
            background: #00ffcc;
            color: #07191d;
            border-color: #00ffcc;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <div class="brand">🕸️ CARCARE WEB AUTOMATION STUDIO</div>
                <div class="meta-info" style="margin-top: 4px;">Live Selenium WebDriver End-to-End Test Report</div>
            </div>
            <div style="text-align: right;">
                <div class="meta-info">Build Execution Timestamp</div>
                <div style="font-weight: 600; font-size: 16px; margin-top: 4px;">{time.strftime("%Y-%m-%d %H:%M:%S")}</div>
            </div>
        </header>

        <div class="grid-kpis">
            <div class="card-kpi">
                <div class="label">Total Web Tests</div>
                <div class="value" style="color: #00d2d3;">{total}</div>
            </div>
            <div class="card-kpi">
                <div class="label">Passed</div>
                <div class="value" style="color: #00ffcc;">{passed}</div>
            </div>
            <div class="card-kpi">
                <div class="label">Failed</div>
                <div class="value" style="color: #ff5e57;">{failed}</div>
            </div>
            <div class="card-kpi">
                <div class="label">Skipped</div>
                <div class="value" style="color: #ffeaa7;">{skipped}</div>
            </div>
            <div class="card-kpi">
                <div class="label">Success Rate</div>
                <div class="value" style="background: linear-gradient(90deg, #00ffcc, #0abde3); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{pass_pct}%</div>
            </div>
            <div class="card-kpi">
                <div class="label">Duration</div>
                <div class="value" style="color: #ffeaa7;">{duration_str}</div>
            </div>
        </div>

        <div class="dashboard-content">
            <div class="card-glass" style="overflow-x: auto;">
                <div class="card-title">Live E2E Test Execution Breakdown</div>
                
                <div class="controls-filter">
                    <button class="btn-filter active" onclick="filterRows('ALL', this)">All</button>
                    <button class="btn-filter" onclick="filterRows('PASS', this)">Passed</button>
                    <button class="btn-filter" onclick="filterRows('FAIL', this)">Failed</button>
                    <button class="btn-filter" onclick="filterRows('SKIP', this)">Skipped</button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 100px;">ID</th>
                            <th style="text-align: left; width: 140px;">Module</th>
                            <th style="text-align: left;">Test Case Name</th>
                            <th style="width: 100px;">Priority</th>
                            <th style="width: 100px;">Status</th>
                            <th style="width: 120px;">Duration</th>
                            <th style="text-align: left; width: 280px;">Error Log Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {case_rows_html}
                    </tbody>
                </table>
            </div>

            <div style="display: flex; flex-direction: column; gap: 30px;">
                <div class="card-glass">
                    <div class="card-title">Target Environment</div>
                    <ul class="device-info-list">
                        <li><span>Live Deployed URL</span><span style="font-size: 11px; word-break: break-all; max-width: 180px; text-align: right;"><a href="{target_url}" target="_blank" style="color:#00ffcc; text-decoration:none;">{target_url}</a></span></li>
                        <li><span>Browser Engine</span><span>Headless Chrome</span></li>
                        <li><span>Execution Type</span><span>Parallel (xdist)</span></li>
                        <li><span>Driver Engine</span><span>Selenium WebDriver</span></li>
                        <li><span>Target Branch</span><span>gh-pages</span></li>
                    </ul>
                </div>

                <div class="card-glass">
                    <div class="card-title">Module Metrics</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="text-align: left;">Module</th>
                                <th>Total</th>
                                <th style="color:#00ffcc;">P</th>
                                <th style="color:#ff5e57;">F</th>
                                <th>Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {module_rows_html}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        function filterRows(status, btn) {{
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.test-row').forEach(row => {{
                if (status === 'ALL' || row.getAttribute('data-status') === status) {{
                    row.style.display = 'table-row';
                }} else {{
                    row.style.display = 'none';
                }}
            }});
        }}
    </script>
</body>
</html>
"""

    report_path = os.path.join(output_dir, "execution-report.html")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html_template)
        
    dashboard_path = os.path.join(output_dir, "dashboard.html")
    with open(dashboard_path, "w", encoding="utf-8") as f:
        f.write(html_template)
        
    print(f"[REPORTER] Web HTML reports successfully generated in {output_dir}")
