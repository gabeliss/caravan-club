import requests
from datetime import datetime
from bs4 import BeautifulSoup
import cloudscraper

def scrape_uncleducky_api(num_travelers, start_date_str, end_date_str):

    start_date = datetime.strptime(start_date_str, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%m/%d/%y').strftime('%Y-%m-%d')


    url = 'https://paddlersvillage.checkfront.com/reserve/inventory/'

    params = {
        'inline': '1',
        'header': 'hide',
        'src': 'https://www.paddlingmichigan.com',
        'filter_category_id': '3,2,4,9',
        'ssl': '1',
        'provider': 'droplet',
        'filter_item_id': '',
        'customer_id': '',
        'original_start_date': '',
        'original_end_date': '',
        'date': '',
        'language': '',
        'cacheable': '1',
        'category_id': '2',
        'view': '',
        'start_date': start_date,
        'end_date': end_date,
        'keyword': '',
        'cf-month': start_date[:7].replace('-', '') + '01'
    }

    headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Host': 'paddlersvillage.checkfront.com',
        'Referer': 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
        'X-Requested-With': 'XMLHttpRequest'
    }

    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()
        inventory = data["inventory"]

        soup = BeautifulSoup(inventory, 'html.parser')
        
        unavailable = soup.find_all(string="Nothing available for the dates selected.")
        if unavailable:
            return {"available": False, "price": None, "message": "Not available for selected dates."}
        else:
            items = soup.find_all(class_="cf-item-data")
            cheapest_price = 10000
            cheapest_name = ''
            for item in items:
                item_summary = item.find(class_="cf-item-summary")
                p_tag_text = item_summary.get_text()
                name = item.find(class_="mobile-title").h2.text

                if num_travelers > 5:
                    if "Sleeps 8" in p_tag_text:
                        item_price_span = item.find(class_="cf-price").strong.span
                        price = float(item_price_span.text.strip("$"))
                        if price < cheapest_price:
                            cheapest_price = price
                            cheapest_name = name
                else:
                    if "Sleeps 5" in p_tag_text:
                        item_price_span = item.find(class_="cf-price").strong.span
                        price = float(item_price_span.text.strip("$"))
                        if price < cheapest_price:
                            cheapest_price = price
                            cheapest_name = name
                        
            if cheapest_price < 10000:
                return {"available": True, "name": cheapest_name, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}
            else:
                return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}

    else:
        print("Failed to retrieve data:", response.status_code)
        return {"error": "Failed to retrieve data", "code": response.status_code}


def scrape_picturedRocksKoa_api(num_travelers, start_date_str, end_date_str):
    scraper = cloudscraper.create_scraper()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    token_url = "https://koa.com/campgrounds/pictured-rocks/reserve/"
    
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
    # uncleDuckyData = scrape_uncleducky_api(5, '09/18/24', '09/20/24')
    # print(uncleDuckyData)
    picturedRocksKoaData = scrape_picturedRocksKoa_api(4, '09/18/24', '09/20/24')
    print(picturedRocksKoaData)


if __name__ == '__main__':
    main()