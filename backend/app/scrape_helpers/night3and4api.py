import requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import requests 
import re
import urllib
from lxml import etree
import cloudscraper


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
        


def scrape_cabinsOfMackinaw_api(num_travelers, start_date_str, end_date_str):

    session = requests.Session()
    session.get("https://ssl.mackinaw-city.com/newreservations/request.php?HotelId=13")

    url = "https://ssl.mackinaw-city.com/newreservations/request.php"

    cookie = session.cookies._cookies['ssl.mackinaw-city.com']['/']['PHPSESSID'].value

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
        'Cookie': 'PHPSESSID=' + cookie,
        'Host': 'ssl.mackinaw-city.com',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }

    session.headers.update(headers)

    start_date = datetime.strptime(start_date_str, '%m/%d/%y')
    end_date = datetime.strptime(end_date_str, '%m/%d/%y')

    params = {
        'roomtype': 7,
        'selectdate': start_date.strftime('%m-%d-%Y'),
        'dayspan': 2,
        'numberrooms': 1,
        'numberguests': num_travelers,
        'ratetype': 'Internet Special',
        'submit_x': 'true'
    }

    response = session.get(url, headers=headers, params=params)

    if response.status_code == 200 and response.text:
        soup = BeautifulSoup(response.text, 'html.parser')

        cabins_data = {}
        
        table = soup.find_all('table', class_='data')[1]
        
        if table:
            tbody = table.find('tbody')
            
            if tbody:
                for row in tbody.find_all('tr'):
                    print(row)
                    a_tag = row.find('a')
                    span_tag = row.find('span')
                    
                    if a_tag and span_tag:
                        title = a_tag.text.strip()
                        price = span_tag.text.strip()

                        cabins_data[title] = price
        
            pc1 = 'Private Chalet - 1 Room Queen Bed'
            pc2 = 'Private Chalet - 1 Room 2 Queen Beds'
            pc3 = 'Private Chalet - 2 Rooms, 2 Queen Beds and 2 TVs'
            pc4 = 'Private Chalet - 3 Rooms, 2 Queen beds, Sofabed in Living Area, 2 TVs'
            available = True
            price = -1
            if num_travelers <= 2:
                if pc1 in cabins_data and cabins_data[pc1] != 'not available':
                    price = cabins_data[pc1]
                else:
                    available = False
            elif num_travelers <= 4:
                if pc2 in cabins_data and cabins_data[pc2] != 'not available':
                    price = cabins_data[pc2]
                elif pc3 in cabins_data and cabins_data[pc3] != 'not available':
                    price = cabins_data[pc3]
                else:
                    available = False
            elif num_travelers <= 6:
                if pc4 in cabins_data and cabins_data[pc4] != 'not available':
                    price = cabins_data[pc4]
                else:
                    available = False 
            else:
                available = False 

            if available:
                price = price.strip("$")
                return {"available": True, "price": price, "message": "Available: $" + price + " per night"}
            else:
                return {"available": False, "price": None, "message": "Not available for selected dates."}              

    else:
        print("Failed to retrieve data, or data is empty.")


def main():
    straightsKoaData = scrape_straightsKoa_api(4, '07/26/24', '07/28/24')
    print(straightsKoaData)
    # cabinsofmackinawData = scrape_cabinsOfMackinaw_api(2, '06/18/24', '06/20/24')
    # print(cabinsofmackinawData)

if __name__ == '__main__':
    main()