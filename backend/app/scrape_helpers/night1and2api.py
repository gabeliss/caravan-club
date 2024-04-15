import requests
from datetime import datetime
from bs4 import BeautifulSoup


def scrape_timberRidge_api(num_travelers, start_date_str, end_date_str):

    url = "https://bookingsus.newbook.cloud/timberridgeresort/api.php"

    headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept": "*/*",
        "Origin": "https://bookingsus.newbook.cloud",
        "Referer": "https://bookingsus.newbook.cloud/timberridgeresort/index.php",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
        "X-Requested-With": "XMLHttpRequest"
    }

    def convert_date(date_str):
        date_obj = datetime.strptime(date_str, '%m/%d/%y')
        return date_obj.strftime('%b %d %Y')  # Example: 'May 28 2024'

    start_date = convert_date(start_date_str)
    end_date = convert_date(end_date_str)

    data = {
        "newbook_api_action": "availability_chart_responsive",
        "available_from": start_date,
        "available_to": end_date,
        "nights": 2,
        "adults": 1,
        "children": 0,
        "infants": 0,
        "animals": 0
    }

    response = requests.post(url, headers=headers, data=data, timeout=30)

    if response.status_code == 200:
        stays = {}
        inventory = response.text
        soup = BeautifulSoup(inventory, 'html.parser')

        all_containers = soup.find_all("div", class_="newbook_online_category_details")
        if not all_containers:
            return {"available": False, "price": None, "message": "Not available for selected dates."}
        
        for container in all_containers:
            a_tag = container.find("h3").find("a") if container.find("h3") else None
            if a_tag:

                stay_name = a_tag.text
                price_span = container.find_all("span", class_="newbook_online_from_price_text")
                if price_span:
                    stay_price = price_span[0].text.lstrip("$")
                    stays[stay_name] = stay_price
                else:
                    stays[stay_name] = 'Unavailable'
        
        yurt_basic = "Yurt Basic Sleeps 5"
        yurt_deluxe = "Yurt Deluxe Sleeps 5"
        if stays[yurt_basic] != "Unavailable":
            price = stays[yurt_basic]
            return {"available": True, "price": price, "message": "Available: $" + price + " per night"}
        elif stays[yurt_deluxe] != "Unavailable":
            price = stays[yurt_deluxe]
            return {"available": True, "price": price, "message": "Available: $" + price + " per night"}
        else:
            return {"available": False, "price": None, "message": "Not available for selected dates."}

    else:
        print("Failed to retrieve data:", response.status_code)
        return {"error": "Failed to retrieve data", "code": response.status_code}



def main():
    timberRidgeData = scrape_timberRidge_api(5, '05/28/24', '05/30/24')
    print(timberRidgeData)


if __name__ == '__main__':
    main()