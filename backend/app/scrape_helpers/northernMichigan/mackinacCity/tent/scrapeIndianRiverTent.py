from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def scrape_indianRiverTent(start_date, end_date, num_adults, num_kids):
    # Convert dates to the required format (YYYY-MM-DD)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%Y-%m-%d")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")

    url = f"https://www.campspot.com/book/indianriverrv/search/{start_date_formatted}/{end_date_formatted}/guests{num_kids},{num_adults},0/list?campsiteCategory=Tent%20Sites"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        context.set_extra_http_headers({
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
        })
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            page.wait_for_selector('div.search-results', timeout=10000)

            no_availability_div = page.query_selector('div.search-results-none')
            if no_availability_div:
                return {"available": False, "price": None, "message": "Not available for selected dates."}
            
            place_container = page.query_selector_all('ul.search-results-list li')[0]

            if place_container:
                price_span = place_container.query_selector('span.app-average-per-night-price')
                if price_span:
                    price_text = price_span.inner_text().strip().replace('$', '')
                    price = float(price_text)
                    return {"available": True, "price": price, "message": f"${price:.2f} per night"}
                else:
                    print("No price found, investigating further")
                    return {"available": False, "price": None, "message": "No options available."}
            else:
                print("No place container found, investigating further")
                return {"available": False, "price": None, "message": "No options found."}

        except Exception as e:
            print(f"An error occurred: {e}")
            screenshot_path = 'error_screenshot.png'
            page.screenshot(path=screenshot_path)
            print(f"An error occurred: {e}")
            print(f"Screenshot saved to {screenshot_path}")
            return {"available": False, "price": None, "message": f"Error: {str(e)}"}

        finally:
            browser.close()

def main():
    # indianRiverData = scrape_indianRiverTent('11/07/24', '11/09/24', 2, 1)
    # print(indianRiverData)
    indianRiverData = scrape_indianRiverTent('05/07/25', '05/09/25', 2, 1)
    print(indianRiverData)

if __name__ == '__main__':
    main()