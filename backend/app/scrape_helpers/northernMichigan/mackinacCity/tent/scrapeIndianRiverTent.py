from datetime import datetime
from playwright.sync_api import sync_playwright
import time
import requests
import json


def scrape_indianRiverTent(start_date, end_date, num_adults, num_kids):
    # Check if start date is before May 1, 2025
    start_month, start_day, start_year = map(int, start_date.split('/'))
    if start_year < 25 or (start_year == 25 and (start_month < 5)):
        return {"available": False, "price": None, "message": "Not available before May 1, 2025"}

    start_date_formatted = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date_formatted = datetime.strptime(end_date, '%m/%d/%y').strftime('%Y-%m-%d')
    guests = f"guests{num_kids},{num_adults},0"

    url = "https://www.campspot.com/api/gator-core/v2/availability/parks/719"
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "x-client-type": "CONSUMER",
        "x-cognito-userpool-clientid": "60jmeb5kmfgfkeljne4car54vo"
    }

    params = {
        "checkin": start_date_formatted,
        "checkout": end_date_formatted,
        "guests": guests,
        "useCustomParkData": True,
        "includeUnavailable": True
    }

    session = requests.Session()
    response = session.get(url, headers=headers, params=params, timeout=30)

    if response.status_code == 200:
        text = response.text
        inventory = json.loads(text)

        minPrice = float('inf')
        for place in inventory:
            if place["availability"] != "AVAILABLE":
                continue

            if place['name'] == "Water and Electric":
                minPrice = place['averagePricePerNight']
                break

        if minPrice == float('inf'):
            return {"available": False, "price": None, "message": "No options available."}
        else:
            return {"available": True, "price": minPrice, "message": f"${minPrice:.2f} per night"}
    else:
        print("Failed to retrieve data:", response)
        return {"available": False, "price": None, "message": "Failed to retrieve data"}


def main():
    # indianRiverData = scrape_indianRiverTent('11/07/24', '11/09/24', 2, 1)
    # print(indianRiverData)
    indianRiverData = scrape_indianRiverTent('05/07/25', '05/09/25', 2, 1)
    print(indianRiverData)

if __name__ == '__main__':
    main()