from datetime import datetime
import requests


def scrape_fortSuperiorTent(start_date, end_date, num_adults, num_kids):
    # Convert dates to timestamps in milliseconds
    start_timestamp = int(datetime.strptime(start_date, '%m/%d/%y').timestamp() * 1000)
    end_timestamp = int(datetime.strptime(end_date, '%m/%d/%y').timestamp() * 1000)

    # API URL
    url = "https://hotels.wixapps.net/api/rooms/search"

    # Payload
    payload = {
        "checkIn": str(start_timestamp),
        "checkOut": str(end_timestamp),
        "adults": str(num_adults)
    }

    # Headers
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        "origin": "https://hotels.wixapps.net",
        "referer": "https://hotels.wixapps.net/index.html/rooms/",
        "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "x-wix-hotels-user-lang": "en",
        "x-wix-instance": "e3V5_uiZIx5AVeNQI_FHABdSXKJTMzuM4gVL9oSpzVk.eyJpbnN0YW5jZUlkIjoiMmU5MGQ2YjktOWZlZC00MGNiLTlhMzItNzNlMWU3Yjk1ZDVkIiwiYXBwRGVmSWQiOiIxMzVhYWQ4Ni05MTI1LTYwNzQtNzM0Ni0yOWRjNmEzYzliY2YiLCJtZXRhU2l0ZUlkIjoiNTIwYTJjZDUtNjg4OC00NWFlLWI4ZDYtMTcxMzZiYmYyNTU5Iiwic2lnbkRhdGUiOiIyMDI0LTEwLTI1VDIxOjQ5OjQxLjYwMloiLCJ2ZW5kb3JQcm9kdWN0SWQiOiJob3RlbHMiLCJkZW1vTW9kZSI6ZmFsc2UsIm9yaWdpbkluc3RhbmNlSWQiOiIwYzFlYmI1ZC1mYTc2LTRkMDUtYWUyYS1lNjRiY2MyM2MyODkiLCJhaWQiOiI3ZDBlYTY5Zi03YWFmLTQyMTctYmFmNS04MDgxOWJlMDZiMWIiLCJiaVRva2VuIjoiN2M5YWZhNmMtZjc2NS0wNTY1LTIyZTQtNjRmMjhjMDY3ODA0Iiwic2l0ZU93bmVySWQiOiI4NGM4ZDM0Yi1mOWYyLTQyM2EtODFjYi04M2Y3YTI5ZTYzZGUifQ",
        "x-xsrf-token": "1729892982|vi-2-zPY5Kwr"
    }

    # Use a session to handle cookies
    session = requests.Session()
    response = session.post(url, headers=headers, json=payload, timeout=30)

    # Check if the response was successful and return the content
    if response.status_code == 200:
        inventory = response.json()
        for room in inventory:
            if room['availableUnits'] == None:
                continue

            if "Canvas Tent Barrack" not in room['room']['name']:
                price = room['room']['offer']['perNight']
                return {"available": True, "price": price, "message": f"${price:.2f} per night"}
        
        return {"available": False, "price": None, "message": "No options available."}
            
    else:
        print("Failed to retrieve data:", response)
        return {"available": False, "price": None, "message": "Failed to retrieve data"}
            

def main():
    fortSuperiorData = scrape_fortSuperiorTent('06/25/25', '06/27/25', 2, 1)
    print(fortSuperiorData)

if __name__ == '__main__':
    main()