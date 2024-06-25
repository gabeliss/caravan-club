import requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import requests 
from playwright.sync_api import sync_playwright
import time


def scrape_straightsKoa_api(num_travelers, start_date, end_date):
    check_in_date = f"{start_date[:6]}20{start_date[6:]}"
    check_out_date = f"{end_date[:6]}20{end_date[6:]}"


    webdriver_path = '../chromedriver'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument(f"executable_path={webdriver_path}")
    #chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)

    # Step 1: Access the main page using Selenium
    driver.get('https://koa.com/campgrounds/st-ignace/')

    # Retrieve cookies from the browser
    cookies = driver.get_cookies()

    # Close the browser
    driver.quit()
    session = requests.Session()
    for cookie in cookies:
        session.cookies.set(cookie['name'], cookie['value'])

    # Check the cookies set by Selenium
    cookies_main = session.cookies.get_dict()
    print("Cookies after main page request:", cookies_main)

    # Format cookies as a string to use in the headers
    cookies_string = '; '.join([f'{key}={value}' for key, value in cookies_main.items()])
    print("Formatted cookies string:", cookies_string)

    # Step 1: Access the main page to initialize cookies
    response_main = session.get('https://koa.com/')
    print("Main page status:", response_main.status_code)

    # Check the cookies set by the main page
    cookies_main = session.cookies.get_dict()
    print("Cookies after main page request:", cookies_main)

    # Format cookies as a string to use in the headers
    cookies_string = '; '.join([f'{key}={value}' for key, value in cookies_main.items()])

    # Step 2: Perform the search request to get redirected to the campground page
    search_url = 'https://koa.com/campgrounds/st-ignace/'
    search_headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': cookies_string,
        'Host': 'koa.com',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15'
    }

    response_search = session.get(search_url, headers=search_headers)
    print("Search page status:", response_search.status_code)

    # Check cookies set by the server after the search request
    print("Cookies after search request:", session.cookies.get_dict())

    # Step 3: Access the campground page directly
    campground_url = 'https://koa.com/campgrounds/st-ignace/'
    campground_headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://koa.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15'
    }

    response_campground = session.get(campground_url, headers=campground_headers)
    print("Campground page status:", response_campground.status_code)

    # Print the content of the final page (optional)
    print(response_campground.text)

    soup = BeautifulSoup(response.text, 'html.parser')
    token = soup.find('input', {'name': '__RequestVerificationToken'})

    if token:
        token = token.get('value')
    else:
        raise ValueError("Token not found in HTML. Check if the page structure has changed.")

    post_url = "https://koa.com/campgrounds/st-ignace/reserve/"

    data = {
        "Reservation.SiteCategory": "A",
        "Reservation.CheckInDate": check_in_date,
        "Reservation.CheckOutDate": check_out_date,
        "Reservation.Adults": str(num_travelers),
        "Reservation.Kids": "0",
        "Reservation.Free": "0",
        "Reservation.Pets": "No",
        "Reservation.EquipmentType": "A",
        "Reservation.EquipmentLength": "0",
        "__RequestVerificationToken": token
    }

    post_response = session.post(post_url, headers=headers, data=data)

    if post_response.status_code == 200 and post_response.text:
        soup = BeautifulSoup(post_response.text, 'html.parser')
        containers = soup.find_all('div', class_='reserve-sitetype-main-row')
        available = False
        cheapest_price = 1000000
        cheapest_name = "placeholder"
        for container in containers:
            name = container.find('h4', class_='reserve-sitetype-title').text
            price_container = container.find('div', class_='reserve-quote-per-night')
            if price_container:
                price = float(price_container.find('strong').find('span').text.lstrip('$').split(' ')[0])
                if price < cheapest_price:
                    cheapest_price = price
                    available = True
                    cheapest_name = name
            else:
                break
        
        if available:
            return {"available": True, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}
        else:
            return {"available": False, "price": None, "message": "Not available for selected dates."} 
        


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
                return {"available": True, "name": name, "price": price, "message": "Available: $" + price + " per night"}
            else:
                return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}              

        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()


def main():
    # straightsKoaData = scrape_straightsKoa_api(4, '07/26/24', '07/28/24')
    # print(straightsKoaData)
    cabinsofmackinawData = scrape_cabinsOfMackinaw_api(2, '07/18/24', '07/20/24')
    print(cabinsofmackinawData)

if __name__ == '__main__':
    main()