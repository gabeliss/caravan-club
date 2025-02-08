from datetime import datetime
import requests
from bs4 import BeautifulSoup


def scrape_timberRidgeTent(start_date, end_date, num_adults, num_kids):
    # start_month, start_day, start_year = map(int, start_date.split('/'))
    # if (start_year == 25 and (start_month < 5)):
    #     return {"available": False, "price": None, "message": "Not available before May 25, 2025"}
    
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
        return date_obj.strftime('%b %d %Y')
    
    start_date_formatted = convert_date(start_date)
    end_date_formatted = convert_date(end_date)

    data = {
        "newbook_api_action": "availability_chart_responsive",
        "available_from": start_date_formatted,
        "available_to": end_date_formatted,
        "nights": 2,
        "adults": num_adults,
        "children": num_kids,
        "infants": 0,
        "animals": 0,
        "equipment_type": 3,
        "equipment_length": 20
    }

    response = requests.post(url, headers=headers, data=data, timeout=30)

    if response.status_code == 200:
        inventory = response.text
        soup = BeautifulSoup(inventory, 'html.parser')
        all_containers = soup.find_all("div", class_="newbook_online_category_details")
        if not all_containers:
            print("No containers found")
            return {"available": False, "price": None, "message": "No options available."}
        
        container = all_containers[0]
        a_tag = container.find("h3").find("a") if container.find("h3") else None
        if a_tag:
            # Check for "Book now" button by looking for a button containing a span with "Book now" text
            book_now_button = container.find("button", class_="button", attrs={"aria-label": "Book now"})
            if not book_now_button:
                return {"available": False, "price": None, "message": "Minimum stay requirement not met"}
            
            price_span = container.find_all("span", class_="newbook_online_from_price_text")
            if price_span:
                price = float(price_span[0].text.lstrip("$"))
                return {
                    "available": True,
                    "price": price,
                    "message": f"${price:.2f} per night"
                }   
            else:
                return {"available": False, "price": None, "message": "No options available."}
        else:
            return {"available": False, "price": None, "message": "No options available."}
    else:
        print("Failed to retrieve data:", response)
        return {"available": False, "price": None, "message": "Failed to retrieve data"}


def main():
    timberRidgeData = scrape_timberRidgeTent('06/21/25', '06/23/25', 4, 1)
    print(timberRidgeData)

if __name__ == '__main__':
    main()