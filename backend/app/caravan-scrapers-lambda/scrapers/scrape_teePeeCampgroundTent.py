from playwright.sync_api import sync_playwright

def baseline_scraper():
    print("Starting Playwright baseline scraper...")
    try:
        with sync_playwright() as p:
            print("Launching Chromium...")
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-dev-shm-usage",  # Prevents shared memory usage issues
                    "--single-process",
                    "--disable-software-rasterizer",
                    "--disable-web-security",
                ]
            )
            print("Chromium launched successfully!")
            page = browser.new_page()
            print("Opening a new page...")
            page.goto("data:text/html,<h1>Hello Playwright!</h1>")
            print("Page opened successfully!")
            browser.close()
            print("Browser closed successfully.")
        return True
    except Exception as e:
        print(f"Error occurred: {e}")
        return False
