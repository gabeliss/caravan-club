from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def scrape_uncleDuckysTent(start_date, end_date, num_adults, num_kids):
    # Check if total number of people exceeds 5
    if num_adults + num_kids > 5:
        return {"available": False, "price": None, "message": "Too many people. Maximum occupancy is 5."}

    # Check if start date is before May 23, 2025
    start_date_obj = datetime.strptime(start_date, "%m/%d/%y")
    if start_date_obj < datetime(2025, 5, 23):
        return {"available": False, "price": None, "message": "Not available yet. Bookings start from May 23, 2025."}
    # Convert dates to the required format (YYYY-MM-DD)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%Y-%m-%d")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")

    url = f'https://paddlersvillage.checkfront.com/reserve/?start_date={start_date_formatted}&end_date={end_date_formatted}&category_id=4'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            unavailable = page.query_selector("//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]")
            if unavailable:
                print('Unavailable, returning False')
                return {"available": False, "price": None, "message": "No options available."}

            first_option = page.query_selector_all('.cf-item-data')[0]
            if first_option:
                price_element = first_option.query_selector(".cf-price strong")
                if price_element:
                    price_text = price_element.inner_text().strip().replace('$', '')
                    price = float(price_text)
                    return {"available": True, "price": price, "message": f"${price:.2f} per night"}
                else:
                    print("No price found, investigating further")
                    return {"available": False, "price": None, "message": "No options available."}
            else:
                print("No first option found, investigating further")
                return {"available": False, "price": None, "message": "No options found."}
            

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"available": False, "price": None, "message": f"Error: {str(e)}"}

        finally:
            browser.close()


def main():
    uncleDuckysData = scrape_uncleDuckysTent('06/23/25', '06/25/25', 2, 1)
    print(uncleDuckysData)

if __name__ == '__main__':
    main()