from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time
import cloudscraper


def scrape_stIgnaceKoa_api(num_travelers, start_date_str, end_date_str):
    scraper = cloudscraper.create_scraper()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    token_url = "https://koa.com/campgrounds/st-ignace/reserve/"
    
    # GET request to fetch the token
    response = scraper.get(token_url, headers=headers)
    if response.status_code != 200:
        return f"Failed to fetch initial page. Status code: {response.status_code}"

    soup = BeautifulSoup(response.text, 'html.parser')
    csrf_token = soup.find('input', {'name': '__RequestVerificationToken'})
    if not csrf_token:
        return "Failed to retrieve CSRF token"
    csrf_token = csrf_token['value']

    # Convert dates
    start_date = datetime.strptime(start_date_str, "%m/%d/%y").strftime("%m/%d/%Y")
    end_date = datetime.strptime(end_date_str, "%m/%d/%y").strftime("%m/%d/%Y")

    # Prepare POST data
    data = {
        "Reservation.SiteCategory": "A",
        "Reservation.CheckInDate": start_date,
        "Reservation.CheckOutDate": end_date,
        "Reservation.Adults": str(num_travelers),
        "Reservation.Kids": "0",
        "Reservation.Free": "0",
        "Reservation.Pets": "No",
        "Reservation.EquipmentType": "A",
        "Reservation.EquipmentLength": "0",
        "__RequestVerificationToken": csrf_token
    }

    # Add referer to headers
    headers["Referer"] = token_url

    # POST request
    response = scraper.post(token_url, data=data, headers=headers)
    
    if response.status_code == 200:
        # Process the response as before
        soup = BeautifulSoup(response.text, 'html.parser')
        rows = soup.find_all('div', class_='row reserve-sitetype-main-row')
        results = []
        cheapest_price = float('inf')
        cheapest_name = None
        for row in rows:
            title = row.find('h4', class_='reserve-sitetype-title').text.strip()
            price_span_element = row.find('div', class_='reserve-quote-per-night')
            if price_span_element and price_span_element.find('strong').find('span'):
                price = price_span_element.find('span').text.strip().lstrip('$')
                if cheapest_price == 'Unavailable' or float(price) < float(cheapest_price):
                    cheapest_price = price
                    cheapest_name = title
            else:
                price = 'Unavailable'
            results.append((title, price))

        if cheapest_price == float('inf'):
            return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}
        else:
            return {"available": True, "name": cheapest_name, "price": cheapest_price, "message": "$" + str(cheapest_price) + " per night"}
    else:
        return f"Failed to fetch data: {response.status_code}, Reason: {response.reason}"
        


def scrape_cabinsOfMackinaw_api(num_travelers, start_date, end_date):
    url = 'https://ssl.mackinaw-city.com/newreservations/request.php?HotelId=13'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)  # Adjust as necessary for page load

        try:
            start_date_with_dashes = start_date.replace("/", "-")
            date_of_arrival_input = page.wait_for_selector('#checkin', timeout=10000)
            date_of_arrival_input.fill('')
            date_of_arrival_input.fill(start_date_with_dashes)

            # Click on page to close it
            random_click = page.wait_for_selector('#content', timeout=10000)
            random_click.click()

            # Enter nights staying
            nights_staying_select = page.wait_for_selector('select[name="dayspan"]', timeout=10000)
            nights_staying_select.select_option(value="2")

            # Click on check rates button
            check_rates_button = page.wait_for_selector('#sub_button', timeout=10000)
            check_rates_button.click()

            time.sleep(1)
            cabins_data = {}
            table = page.query_selector_all('table.data')[1]
            
            if table:
                tbody = table.query_selector('tbody')
                
                if tbody:
                    rows = tbody.query_selector_all('tr')
                    for row in rows:
                        a_tag = row.query_selector('a')
                        span_tag = row.query_selector('span')
                        
                        if a_tag and span_tag:
                            title = a_tag.inner_text().strip()
                            price = span_tag.inner_text().strip()

                            cabins_data[title] = price
            
            pc1 = 'Private Chalet - 1 Room Queen Bed'
            pc2 = 'Private Chalet - 1 Room 2 Queen Beds'
            pc3 = 'Private Chalet - 2 Rooms, 2 Queen Beds and 2 TVs'
            pc4 = 'Private Chalet - 3 Rooms, 2 Queen beds, Sofabed in Living Area, 2 TVs'
            name = ""
            available = True
            price = -1
            if num_travelers <= 2:
                if pc1 in cabins_data and cabins_data[pc1] != 'not available':
                    price = cabins_data[pc1]
                    name = pc1
                else:
                    available = False
            elif num_travelers <= 4:
                if pc2 in cabins_data and cabins_data[pc2] != 'not available':
                    price = cabins_data[pc2]
                    name = pc2
                elif pc3 in cabins_data and cabins_data[pc3] != 'not available':
                    price = cabins_data[pc3]
                    name = pc3
                else:
                    available = False
            elif num_travelers <= 6:
                if pc4 in cabins_data and cabins_data[pc4] != 'not available':
                    price = cabins_data[pc4]
                    name = pc4
                else:
                    available = False 
            else:
                available = False 

            if available:
                price = price.strip("$")
                return {"available": True, "name": name, "price": price, "message": "$" + price + " per night"}
            else:
                return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}              

        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()


def scrape_straitsStatePark_api(num_travelers, start_date, end_date):
    url = 'https://midnrreservations.com/create-booking'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        page.wait_for_selector('#park-autocomplete', timeout=10000)

        try:
            consent_button = page.query_selector('#consentButton')
            if consent_button:
                consent_button.click()
            # Fill in the park name
            park_input = page.query_selector('#park-autocomplete')
            park_input.fill('Straits')
            park_input.press('Enter')

            # Click the arrival date input field
            arrival_date_input = page.query_selector('#arrival-date-field')
            arrival_date_input.click()
            # Click the month dropdown picker
            month_dropdown_picker = page.query_selector('#monthDropdownPicker')
            month_dropdown_picker.click()

            # Select the correct month
            start_date_obj = datetime.strptime(start_date, '%m/%d/%y')
            month_name = start_date_obj.strftime('%b')
            year = start_date_obj.strftime('%Y')
            aria_label = f'{month_name} {year}'

            calendar_buttons = page.query_selector_all('.mat-calendar-body-cell')
            for button in calendar_buttons:
                if button.get_attribute('aria-label') == aria_label:
                    button.click()
                    break

            day = start_date_obj.strftime('%-d')  # Using %-d to strip leading zeroes
            day_buttons = page.query_selector_all('.mat-calendar-body-cell-content.mat-focus-indicator')
            for day_button in day_buttons:
                if day_button.text_content().strip() == day:
                    day_button.click()
                    break
            
            end_date_obj = datetime.strptime(end_date, '%m/%d/%y')
            if end_date_obj.month != start_date_obj.month:
                next_month_button = page.query_selector('#nextYearButton')
                next_month_button.click()

            # Select the correct day for the end date
            end_day = end_date_obj.strftime('%-d')  # Using %-d to strip leading zeroes
            day_buttons = page.query_selector_all('.mat-calendar-body-cell-content.mat-focus-indicator')
            for day_button in day_buttons:
                if day_button.text_content().strip() == end_day:
                    day_button.click()
                    break

            party_size_input = page.query_selector('#party-size-field')
            party_size_input.click()
            party_size_input.fill(str(num_travelers))

            accommodation_select = page.query_selector('#mat-select-value-1')
            accommodation_select.click()

            tents_option = page.query_selector('#mat-option-0')
            tents_option.click()

            search_button = page.query_selector('#actionSearch')
            search_button.click()
            time.sleep(1)

            page.wait_for_selector('#list-view-button', timeout=10000)
            list_view_button = page.query_selector('#list-view-button')
            list_view_button.click()
            time.sleep(2)

            result = page.wait_for_selector('h2:has-text("No Available Sites"), #mapLink-button-0', timeout=10000)
            # Click the map link button
            if result.get_attribute('id') == 'mapLink-button-0':
                result.click()
            else:
                print("No Available Sites message found")
                return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}

            # Click the first item in the list view results
            time.sleep(1)
            page.wait_for_selector('.list-view-results.ng-star-inserted', timeout=10000)
            first_item = page.wait_for_selector('.list-view-results.ng-star-inserted mat-expansion-panel', timeout=10000)
            first_item.click()

            # Retrieve the h2 tag with the title
            title_h2 = first_item.wait_for_selector('h2#resourceName', timeout=10000)
            title = title_h2.text_content().strip() if title_h2 else "Title not found"

            # Retrieve the span with the price
            price_span = first_item.wait_for_selector('.ng-star-inserted .bold', timeout=10000)
            price = price_span.text_content().replace('$', '').strip() if price_span else "Price not found"
            
            if title != "Title not found":
                return {"available": True, "name": title, "price": float(price), "message": "$" + price + " per night"}
            else:
                return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}

        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()


def main():
    stIgnaceKoaData = scrape_stIgnaceKoa_api(4, '08/20/24', '08/22/24')
    print(stIgnaceKoaData)
    # cabinsofmackinawData = scrape_cabinsOfMackinaw_api(2, '07/18/24', '07/20/24')
    # print(cabinsofmackinawData)

if __name__ == '__main__':
    main()