import requests
from datetime import datetime
from bs4 import BeautifulSoup

def scrape_uncleDuckysTent(start_date, end_date, num_adults, num_kids):
    try:
        # Format the start and end dates
        start_date_formatted = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
        end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")
        cf_month = f"{start_date_formatted[:4]}{start_date_formatted[5:7]}01"  # Extract year and month for cf-month

        # Set up URL and query parameters
        url = "https://paddlersvillage.checkfront.com/reserve/inventory/"
        params = {
            "inline": "1",
            "header": "hide",
            "options": "tabs",
            "src": "https://www.paddlingmichigan.com",
            "filter_category_id": "8,15,14,13,16,20",
            "ssl": "1",
            "provider": "droplet",
            "filter_item_id": "",
            "customer_id": "",
            "original_start_date": "",
            "original_end_date": "",
            "date": "",
            "language": "",
            "cacheable": "1",
            "category_id": "14",
            "view": "",
            "start_date": start_date_formatted,
            "end_date": end_date_formatted,
            "keyword": "",
            "cf-month": cf_month
        }

        # Set up headers
        headers = {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "x-newrelic-id": "Vg4FUF9WCxABVlVbAgIFUFAG",
            "x-requested-with": "XMLHttpRequest"
        }

        # Use a session to handle cookies automatically
        session = requests.Session()
        response = session.get(url, headers=headers, params=params, timeout=30)

        # Raise an HTTPError for unsuccessful status codes
        response.raise_for_status()

        # Parse JSON and HTML
        data = response.json()
        inventory = data.get('inventory')
        if not inventory:
            return {"available": False, "price": None, "message": "No inventory data found."}

        soup = BeautifulSoup(inventory, 'html.parser')
        all_stay_containers = soup.find_all("div", class_="cf-item-data")
        
        if not all_stay_containers:
            return {"available": False, "price": None, "message": "No options available."}

        min_price = float('inf')
        for container in all_stay_containers:
            price_div = container.find("div", class_="cf-price")
            if price_div:
                price_span = price_div.find("strong").find("span")
                if price_span:
                    try:
                        price = float(price_span.text.strip('$'))
                        min_price = min(min_price, price)
                    except ValueError:
                        print(f"Failed to parse price: {price_span.text}")

        if min_price == float('inf'):
            return {"available": False, "price": None, "message": "No options available."}
        else:
            return {"available": True, "price": min_price, "message": f"${min_price:.2f} per night"}
    
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return {"available": False, "price": None, "message": "Network error occurred."}
    except ValueError as ve:
        print(f"JSON parsing error: {ve}")
        return {"available": False, "price": None, "message": "Data parsing error."}


def main():
    uncleDuckysData = scrape_uncleDuckysTent('06/08/25', '06/10/25', 3, 0)
    print(uncleDuckysData)

if __name__ == '__main__':
    main()