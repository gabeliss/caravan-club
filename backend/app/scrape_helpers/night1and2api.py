import requests
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time
import traceback
import cloudscraper

# couldn't access, blocked by captcha
def scrape_traverseCityStatePark_api(num_travelers, start_date, end_date):
    url = 'https://midnrreservations.com/create-booking'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
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


def scrape_traverseCityKoa_api(num_travelers, start_date_str, end_date_str):
    scraper = cloudscraper.create_scraper()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    token_url = "https://koa.com/campgrounds/traverse-city/reserve/"
    
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
            return {"available": True, "name": cheapest_name, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}
    else:
        return f"Failed to fetch data: {response.status_code}, Reason: {response.reason}"
    

def main():
    # traverseCityStateParkData = scrape_traverseCityStatePark_api(2, '2024-05-21', '2024-05-23')
    # print(traverseCityStateParkData)
    # timberRidgeData = scrape_timberRidge_api(4, '08/20/24', '08/23/24')
    # print(timberRidgeData)
    # anchorInnData = scrape_anchorInn_api(4, '08/20/24', '08/22/24')
    # print(anchorInnData)
    traverseCityKoaData = scrape_traverseCityKoa_api(4, '08/20/24', '08/22/24')
    print(traverseCityKoaData)

if __name__ == '__main__':
    main()