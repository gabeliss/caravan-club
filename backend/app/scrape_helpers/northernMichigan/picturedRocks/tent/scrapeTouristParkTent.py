from datetime import datetime
import requests
import json


def scrape_touristParkTent(start_date, end_date, num_adults, num_kids):
    start_month, start_day, start_year = map(int, start_date.split('/'))
    if start_year < 25 or (start_year == 25 and (start_month < 5 or (start_month == 5 and start_day < 15))):
        return {"available": False, "price": None, "message": "Not available before May 15, 2025"}
    # Convert dates to the required format (YYYY-MM-DD)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%Y-%m-%d")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")
    guests = f"guests{num_kids},{num_adults},0"

    # Set up URL and query parameters
    url = "https://www.campspot.com/api/gator-core/v2/availability/parks/1850"
    params = {
        "checkin": start_date_formatted,
        "checkout": end_date_formatted,
        "guests": guests,
        "useCustomParkData": "true",
        "includeUnavailable": "true"
    }

    # Set up headers
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

    # Use a session to handle cookies automatically
    session = requests.Session()
    response = session.get(url, headers=headers, params=params, timeout=30)

    # Check if the response was successful and return the content
    if response.status_code == 200:
        data = response.json()
        if data == []:
            return {"available": False, "price": None, "message": "No options available."}
        
        # First, check for Waterfront Rustic Tent Site
        for site in data:
            if site['name'] == 'Waterfront Rustic Tent Site' and site['availability'] == 'AVAILABLE':
                return {
                    "available": True,
                    "price": site['averagePricePerNight'],
                    "message": f"${site['averagePricePerNight']:.2f} per night"
                }
        
        # If waterfront not available, check for regular Rustic Tent Site
        for site in data:
            if site['name'] == 'Rustic Tent Site' and site['availability'] == 'AVAILABLE':
                return {
                    "available": True,
                    "price": site['averagePricePerNight'],
                    "message": f"${site['averagePricePerNight']:.2f} per night"
                }
        
        return {"available": False, "price": None, "message": "No tent sites available"}
    else:
        print("Failed to retrieve data:", response)
        return {"available": False, "price": None, "message": "Failed to retrieve data"}

def main():
    touristParkData = scrape_touristParkTent('06/08/25', '06/10/25', 3, 1)
    print(touristParkData)

if __name__ == '__main__':
    main()