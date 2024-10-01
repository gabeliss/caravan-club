from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def scrape_timberRidgeTent(start_date, end_date, num_adults, num_kids):
    # Convert dates to the required format (DD-MM-YY)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%d-%m-%y")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%d-%m-%y")

    url = f"https://bookingsus.newbook.cloud/timberridgeresort/index.php?available_from={start_date_formatted}&available_to={end_date_formatted}&adults={num_adults}&kids={num_kids}&equipment_type=3&equipment_length=20"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            page.wait_for_selector('#category-list')

            first_option = page.query_selector('.newbook_online_category_box')

            if first_option:
                price_element = first_option.query_selector('.newbook_online_from_price_text')

                if price_element:
                    price = float(price_element.inner_text().replace('$', ''))
                    return {
                        "available": True,
                        "price": price,
                        "message": f"${price:.2f} per night"
                    }
                else:
                    return {"available": False, "price": None, "message": "No options available."}
            else:
                return {"available": False, "price": None, "message": "No options found."}

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"available": False, "price": None, "message": f"Error: {str(e)}"}

        finally:
            browser.close()

def main():
    #timberRidgeDataUnavailable = scrape_timberRidgeTent('10/01/24', '10/03/24', 8, 1)
    #print(timberRidgeDataUnavailable)
    timberRidgeData = scrape_timberRidgeTent('10/01/24', '10/03/24', 3, 1)
    print(timberRidgeData)

if __name__ == '__main__':
    main()