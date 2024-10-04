from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def scrape_touristParkTent(start_date, end_date, num_adults, num_kids):
    # Convert dates to the required format (YYYY-MM-DD)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%Y-%m-%d")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")

    url = f"https://www.campspot.com/book/munisingtouristparkcampground/search/{start_date_formatted}/{end_date_formatted}/guests{num_kids},{num_adults},0/list?campsiteCategory=Tent%20Sites"

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
            
            place_containers = page.query_selector_all('ul.search-results-list li')
            place_container = None
            for container in place_containers:
                if 'search-results-ad' in container.get_attribute('class'):
                    continue
                site_name = container.query_selector('.search-results-site-title').inner_text().strip()
                if site_name == 'Waterfront Rustic Tent Site':
                    place_container = container
                    break
            
            if not place_container:
                for container in place_containers:
                    if 'search-results-ad' in container.get_attribute('class'):
                        continue
                    site_name = container.query_selector('.search-results-site-title').inner_text().strip()
                    if site_name == 'Rustic Tent Site':
                        place_container = container
                        break

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
            return {"available": False, "price": None, "message": f"Error: {str(e)}"}

        finally:
            browser.close()

def main():
    touristParkData = scrape_touristParkTent('10/15/24', '10/17/24', 2, 1)
    print(touristParkData)

if __name__ == '__main__':
    main()