# automation/runners/verify_deployment.py
import sys
import os
import urllib.request
import re

def main():
    target_url = os.environ.get("BASE_URL", "https://kandukurusantosh3.github.io/car-care/")
    print(f"==============================================")
    print(f"Verifying Live Deployment Availability: {target_url}")
    print(f"==============================================")
    
    try:
        # 1. Check HTTP Status Code
        req = urllib.request.Request(
            target_url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            status = response.status
            html_content = response.read().decode('utf-8')
            
        print(f"[STATUS] Live URL returned HTTP {status}")
        if status != 200:
            print(f"[ERROR] Live URL returned invalid status: {status}")
            sys.exit(1)
            
        # 2. Check main page content (React root div check)
        if "id=\"root\"" not in html_content and "<div" not in html_content:
            print("[WARNING] Could not locate React root div container structure.")
            
        # 3. Check for asset links
        css_assets = re.findall(r'href="[^"]+\.css"', html_content)
        js_assets = re.findall(r'src="[^"]+\.js"', html_content)
        
        print(f"[ASSETS] Detected {len(css_assets)} stylesheet assets in HTML wrapper.")
        print(f"[ASSETS] Detected {len(js_assets)} JavaScript assets in HTML wrapper.")
        
        print("Live deployment verification SUCCEEDED! System ready for E2E testing.")
        
    except Exception as e:
        print(f"[FATAL] Deployment Verification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
