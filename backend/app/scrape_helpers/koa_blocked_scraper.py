import cloudscraper
import random
import time
from datetime import datetime
from bs4 import BeautifulSoup

#### note KOA seems to have blocked my IP. saving this script
#### in case we ever get in contact with them
#### will use selenium method in meantime

def scrape_traverseCityKoa_api(num_travelers, start_date_str, end_date_str):
    scraper = cloudscraper.create_scraper()

    user_agents = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:89.0) Gecko/20100101 Firefox/89.0"
    ]

    headers = {
        "User-Agent": random.choice(user_agents),
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

    # Delay to avoid rate limiting
    time.sleep(random.uniform(1, 3))

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