from datetime import datetime
import requests
import json


def scrape_leelanauPinesTent(start_date, end_date, num_adults, num_kids):
    start_date_formatted = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date_formatted = datetime.strptime(end_date, '%m/%d/%y').strftime('%Y-%m-%d')

    url = "https://campspot-embedded-booking-ytynsus4ka-uc.a.run.app/parks/2000/search"
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
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
        text = response.text
        inventory = json.loads(text)
        tent_sites = ["Standard Back-In RV", "Deluxe Back-In RV", "Lakefront Basic RV", "Premium Back-In RV"]
        minPrice = float('inf')
        for place in inventory['data']:
            if place["availability"] != "AVAILABLE":
                continue

            if place['name'] == "Lakefront Basic RV":
                minPrice = place['averagePricePerNight']
                break

            if place['name'] in tent_sites:
                if place['averagePricePerNight'] < minPrice:
                    minPrice = place['averagePricePerNight']

        if minPrice == float('inf'):
            return {"available": False, "price": None, "message": "No options available."}
        else:
            return {"available": True, "price": minPrice, "message": f"${minPrice:.2f} per night"}
    else:
        print("Failed to retrieve data:", response)
        return {"available": False, "price": None, "message": "Failed to retrieve data"}


def main():
    leelanauPinesData = scrape_leelanauPinesTent('06/06/25', '06/08/25', 3, 1)
    print(leelanauPinesData)

if __name__ == '__main__':
    main()