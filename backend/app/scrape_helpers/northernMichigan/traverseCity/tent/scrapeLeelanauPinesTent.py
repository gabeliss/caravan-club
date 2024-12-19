import requests
import json
import gzip
import brotli  # Import Brotli for handling Brotli compression
from datetime import datetime

def scrape_leelanauPinesTent(start_date, end_date, num_adults, num_kids):
    # Check if start date is before May 2, 2025
    start_month, start_day, start_year = map(int, start_date.split('/'))
    if start_year < 25 or (start_year == 25 and (start_month < 5 or (start_month == 5 and start_day < 2))):
        return {"available": False, "price": None, "message": "Not available before May 2, 2025"}

    start_date_formatted = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date_formatted = datetime.strptime(end_date, '%m/%d/%y').strftime('%Y-%m-%d')

    url = "https://campspot-embedded-booking-ytynsus4ka-uc.a.run.app/parks/2000/search"
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "origin": "https://leelanaupinescampresort.com",
        "referer": "https://leelanaupinescampresort.com/",
        "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    }

    params = {
        "checkIn": start_date_formatted,
        "checkOut": end_date_formatted,
        "adults": num_adults,
        "children": num_kids,
        "pets": 0,
    }

    response = requests.get(url, headers=headers, params=params, timeout=30)

    if response.status_code == 200:
        try:
            # Check encoding and decompress accordingly
            if response.headers.get("Content-Encoding") == "gzip":
                text = gzip.decompress(response.content).decode('utf-8')
            elif response.headers.get("Content-Encoding") == "br":
                try:
                    text = brotli.decompress(response.content).decode('utf-8')
                except brotli.error as e:
                    text = response.content.decode('utf-8')  # Attempt to decode directly if Brotli fails
            else:
                text = response.text

            inventory = json.loads(text)
            tent_sites = ["Standard Back-In RV", "Deluxe Back-In RV", "Lakefront Basic RV", "Premium Back-In RV"]
            minPrice = float('inf')
            for place in inventory.get('data', []):
                if place["availability"] != "AVAILABLE":
                    continue

                if place['name'] == "Lakefront Basic RV":
                    minPrice = place['averagePricePerNight']
                    break

                if place['name'] in tent_sites and place['averagePricePerNight'] < minPrice:
                    minPrice = place['averagePricePerNight']

            if minPrice == float('inf'):
                return {"available": False, "price": None, "message": "No options available."}
            else:
                return {"available": True, "price": minPrice, "message": f"${minPrice:.2f} per night"}

        except json.JSONDecodeError as e:
            print("Failed to parse JSON response:", text)
            return {"available": False, "price": None, "message": "Invalid JSON response from API"}
    else:
        print(f"Failed to retrieve data: Status Code {response.status_code}, Response: {response.text}")
        return {"available": False, "price": None, "message": "Failed to retrieve data"}


def main():
    leelanauPinesData = scrape_leelanauPinesTent('06/04/25', '06/06/25', 3, 1)
    print(leelanauPinesData)

if __name__ == '__main__':
    main()