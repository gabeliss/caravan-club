import requests
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


def scrape_traverseCityStatePark_api(num_travelers, start_date, end_date):
    url = 'https://midnrreservations.com/create-booking'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
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
            park_input.fill('Traverse City')
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

            # Click the map link button
            page.wait_for_selector('#mapLink-button-0', timeout=10000)
            map_link_button = page.query_selector('#mapLink-button-0')
            map_link_button.click()

            # Click the first item in the list view results
            page.wait_for_selector('.list-view-results.ng-star-inserted', timeout=10000)
            first_item = page.query_selector('.list-view-results.ng-star-inserted mat-expansion-panel')
            first_item.click()

            # Retrieve the span with the price
            price_span = first_item.query_selector('.ng-star-inserted .bold')
            price = price_span.text_content().strip() if price_span else "Price not found"
            
            print(f"Price: {price}")

            return True

        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()


def scrape_timberRidge_api(num_travelers, start_date_str, end_date_str):

    url = "https://bookingsus.newbook.cloud/timberridgeresort/api.php"

    headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "*/*",
        "Origin": "https://bookingsus.newbook.cloud",
        "Referer": "https://bookingsus.newbook.cloud/timberridgeresort/index.php",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
        "X-Requested-With": "XMLHttpRequest"
    }

    def convert_date(date_str):
        date_obj = datetime.strptime(date_str, '%m/%d/%y')
        return date_obj.strftime('%b %d %Y')  # Example: 'May 28 2024'

    start_date = convert_date(start_date_str)
    end_date = convert_date(end_date_str)

    data = {
        "newbook_api_action": "availability_chart_responsive",
        "available_from": start_date,
        "available_to": end_date,
        "nights": 2,
        "adults": num_travelers,
        "children": 0,
        "infants": 0,
        "animals": 0
    }

    response = requests.post(url, headers=headers, data=data, timeout=30)

    if response.status_code == 200:
        stays = {}
        inventory = response.text
        soup = BeautifulSoup(inventory, 'html.parser')

        all_containers = soup.find_all("div", class_="newbook_online_category_details")
        if not all_containers:
            return {"available": False, "price": None, "message": "Not available for selected dates."}
        
        for container in all_containers:
            a_tag = container.find("h3").find("a") if container.find("h3") else None
            if a_tag:

                stay_name = a_tag.text
                price_span = container.find_all("span", class_="newbook_online_from_price_text")
                if price_span:
                    buttons = container.find_all('button', class_='newbook_responsive_button')
                    button_label = buttons[2].get('aria-label')
                    if button_label == "Book now":
                        stay_price = price_span[0].text.lstrip("$")
                        stays[stay_name] = stay_price
                    else:
                        stays[stay_name] = 'Unavailable'
                else:
                    stays[stay_name] = 'Unavailable'
        
        bunkhouse = "Bunkhouse (Sleeps 10)"
        cabin_deluxe = "Cabin Deluxe (Sleeps 2.)"
        cottage = "Cottage (Sleeps 5)"
        cottage_premium = "Cottage Premium  (Sleeps 5)"
        park_home = "Park Home (Sleeps 5+)"
        premium_park_home = "Premium Park Home  (sleeps 7)"
        yurt_basic = "Yurt Basic Sleeps 5"
        yurt_deluxe = "Yurt Deluxe Sleeps 5"

        available = True
        name = None
        price = -1
        if num_travelers <= 2:
            if stays[cabin_deluxe] != "Unavailable":
                name = cabin_deluxe
                price = stays[cabin_deluxe]
            elif stays[yurt_deluxe] != "Unavailable":
                name = yurt_deluxe
                price = stays[yurt_deluxe]
            elif stays[yurt_basic] != "Unavailable":
                name = yurt_basic
                price = stays[yurt_basic]
            elif stays[cottage] != "Unavailable":
                name = cottage
                price = stays[cottage]
            elif stays[cottage_premium] != "Unavailable":
                name = cottage_premium
                price = stays[cottage_premium]
            elif stays[park_home] != "Unavailable":
                name = park_home
                price = stays[park_home]
            else:
                available = False
                price = None
        elif num_travelers <= 5:
            if stays[yurt_deluxe] != "Unavailable":
                name = yurt_deluxe
                price = stays[yurt_deluxe]
            elif stays[yurt_basic] != "Unavailable":
                name = yurt_basic
                price = stays[yurt_basic]
            elif stays[cottage] != "Unavailable":
                name = cottage
                price = stays[cottage]
            elif stays[cottage_premium] != "Unavailable":
                name = cottage_premium
                price = stays[cottage_premium]
            elif stays[park_home] != "Unavailable":
                name = park_home
                price = stays[park_home]
            else:
                available = False
                price = None  
        elif num_travelers <= 7:
            if stays[premium_park_home] != "Unavailable":
                name = premium_park_home
                price = stays[premium_park_home]
            elif stays[bunkhouse] != "Unavailable":
                name = bunkhouse
                price = stays[bunkhouse]
            else:
                available = False
                price = None  
        else:
            if stays[bunkhouse] != "Unavailable":
                name = bunkhouse
                price = stays[bunkhouse]
            else:
                available = False
                price = None                                  

        if available:
            return {"available": True, "name": name, "price": price, "message": "Available: $" + price + " per night"}
        else:
            return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}

    else:
        print("Failed to retrieve data:", response.status_code)
        return {"error": "Failed to retrieve data", "code": response.status_code}
    


def get_available_stay_anchorInn_helper(stays, num_travelers):
    available = True
    price = -1
    name = ""

    stay_options = [
        (2, [
            "Cozy Queen Room",
            "Single Queen Room",
            "King Room",
            "King w/ Fireplace & Sofa-Bed",
            "1 Bedroom with Kitchenette"
        ]),
        (4, [
            "1 Bedroom with Kitchenette",
            "King w/ Fireplace & Sofa-Bed",
            "2 Bedrooms with Full Kitchen",
            "Lake House"
        ]),
        (6, [
            "2 Bedrooms with Full Kitchen",
            "Lake House"
        ])
    ]

    for max_travelers, options in stay_options:
        if num_travelers <= max_travelers:
            for option in options:
                if stays.get(option) != "Unavailable":
                    price = stays[option]
                    name = option
                    break
            else:
                available = False
            break
    else:
        available = False

    if available:
        return {"available": True, "name": name, "price": price, "message": "Available: $" + str(price) + " per night"}
    else:
        return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}


def scrape_anchorInn_api(num_travelers, start_date_str, end_date_str):

    stays = {
        "Single Queen Room": "Unavailable",
        "Lake House": "Unavailable",
        "Cozy Queen Room": "Unavailable",
        "1 Bedroom with Kitchenette": "Unavailable",
        "2 Bedrooms with Full Kitchen": "Unavailable",
        "King Room": "Unavailable",
        "King w/ Fireplace & Sofa-Bed": "Unavailable",
    }

    start_date = datetime.strptime(start_date_str, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%m/%d/%y').strftime('%Y-%m-%d')
    
    url = f"https://secure.thinkreservations.com/api/hotels/3399/availabilities/v2?start_date={start_date}&end_date={end_date}&number_of_adults={num_travelers}&number_of_children=0&session_id=ad0b9271-17e5-46c8-9d5c-6f50ad3f938b"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://secure.thinkreservations.com",
        "Referer": "https://secure.thinkreservations.com/anchorinn/reservations/availability",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    }

    response = requests.post(url, headers=headers, data={})

    if response.status_code == 200:
        units = response.json()
        for unit in units:
            name = unit["unit"]["name"]
            valid = (len(unit["validRateTypeAvailabilities"]) > 0)
            price = unit["rateTypeAvailabilities"][0]["averagePricePerDay"]
            if valid:
                stays[name] = price

        # Use the refactored get_available_stay function
        result = get_available_stay_anchorInn_helper(stays, num_travelers)
        return result

    else:
        print(f"Failed to fetch data: {response.status_code}, {response.text}")
        return {"error": "Failed to retrieve data", "code": response.status_code}


def scrape_traverseCityKoa_api(num_travelers, start_date, end_date):
    months_dict = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
        "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
    }

    url = "https://koa.com/campgrounds/traverse-city/reserve/"

    options = uc.ChromeOptions()
    options.headless = True
    ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
    options.add_argument(f'--user-agent={ua}')
    driver = uc.Chrome(options=options)

    driver.get(url)
    time.sleep(1)

    try:
        try:
            cookie_notice = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CLASS_NAME, "close-cookie-notice")))
            cookie_notice.click()
            WebDriverWait(driver, 10).until(EC.invisibility_of_element(cookie_notice))
        except Exception as e:
            print(f"No cookie notice to close or error closing it: {e}")
        select_site_category = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_SiteCategory'))))
        select_site_category.select_by_value('A')

        check_in_date_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_CheckInDate')))
        check_in_date_input.click()

        start_month = start_date[0:2]
        start_day = start_date[3:5]
        start_year = '20' + start_date[6:10]

        select_month = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-month'))))
        select_month.select_by_visible_text(months_dict[start_month])

        select_year = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-year'))))
        select_year.select_by_visible_text(start_year)

        day_selector = f'a.ui-state-default[data-date="{int(start_day)}"]'
        select_day = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, day_selector)))
        select_day.click()

        check_out_date_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_CheckOutDate')))
        check_out_date_input.click()

        end_month = end_date[0:2]
        end_day = end_date[3:5]
        end_year = '20' + end_date[6:10]

        select_month = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-month'))))
        select_month.select_by_visible_text(months_dict[end_month])

        select_year = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-year'))))
        select_year.select_by_visible_text(end_year)

        day_selector = f'a.ui-state-default[data-date="{int(end_day)}"]'
        select_day = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, day_selector)))
        select_day.click()

        adults_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_Adults')))
        driver.execute_script("arguments[0].value = '';", adults_input)  # Clear the input field using JavaScript
        adults_input.send_keys(str(num_travelers))

        pets_group = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'Reservation_Pets_Group')))
        second_label = pets_group.find_elements(By.TAG_NAME, 'label')[1]
        second_label.click()

        equipment_type = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_EquipmentType'))))
        equipment_type.select_by_value('A')

        next_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'nextButton')))
        next_button.click()

        time.sleep(1)

        rows = driver.find_elements(By.CSS_SELECTOR, 'div.row.reserve-sitetype-main-row')
        results = []

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
            return {"available": True, "name": cheapest_name, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"error": "Failed to retrieve data", "e": {e}}

    finally:
        driver.quit()

    

def main():
    traverseCityStateParkData = scrape_traverseCityStatePark_api(2, '08/20/24', '08/22/24')
    print(traverseCityStateParkData)
    # timberRidgeData = scrape_timberRidge_api(4, '08/20/24', '08/23/24')
    # print(timberRidgeData)
    # anchorInnData = scrape_anchorInn_api(4, '08/20/24', '08/22/24')
    # print(anchorInnData)
    # traverseCityKoaData = scrape_traverseCityKoa_api(4, '08/20/24', '08/22/24')
    # print(traverseCityKoaData)

if __name__ == '__main__':
    main()