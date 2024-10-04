from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def scrape_fortSuperiorTent(start_date, end_date, num_adults, num_kids):
    start_timestamp = int(datetime.strptime(start_date, '%m/%d/%y').timestamp() * 1000)
    end_timestamp = int(datetime.strptime(end_date, '%m/%d/%y').timestamp() * 1000)

    url = f"https://www.fortsuperiorcampground.com/campsites/rooms/%3FcheckIn%3D{start_timestamp}%26checkOut%3D{end_timestamp}%26adults%3D{num_adults}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto(url, wait_until="domcontentloaded")

            iframe_element = page.wait_for_selector("iframe[title='Book a Room']", timeout=10000)
            if not iframe_element:
                raise Exception("Could not find iframe with title 'Book a Room'")

            iframe = iframe_element.content_frame()
            if not iframe:
                raise Exception("Could not get content frame from iframe")

            try:
                li_elements = iframe.wait_for_selector("li.room", state="attached", timeout=5000)
            except Exception as e:
                return {"available": False, "price": None, "message": "Not available for selected dates."}

            li_elements = iframe.query_selector_all("li.room")

            for li in li_elements:
                site_name_element = li.query_selector("h3 a span.strans")

                if not site_name_element:
                    continue
                site_name = site_name_element.inner_text()
                if "Canvas Tent Barrack" not in site_name:
                    price_element = li.query_selector("div.price span.value")

                    if not price_element:
                        continue
                    price_text = price_element.inner_text()
                    price = float(price_text.replace("$", ""))
                    return {"available": True, "price": price, "message": f"${price} per night"}
            
            return {"available": False, "price": None, "message": "Not available for selected dates."}

        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()\
            

def main():
    fortSuperiorData = scrape_fortSuperiorTent('10/9/24', '10/11/24', 2, 1)
    print(fortSuperiorData)

if __name__ == '__main__':
    main()