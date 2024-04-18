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
        "adults": num_travelers,
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
    


def scrape_anchorInn_api(num_travelers, start_date_str, end_date_str):

    stays = {
        "Single Queen Room": "Unavailable",
        "Lake House": "Unavailable",
        "Cozy Queen Room": "Unavailable",
        "1 Bedroom with Kitchenette": "Unavailable",
        "2 Bedrooms with Full Kitchen": "Unavailable",
        "King Room": "Unavailable",
        "King w/ Fireplace & Sofa-Bed": "Unavailable",
    }

    stays_ordered = ["Single Queen Room", "Cozy Queen Room", "King Room", "1 Bedroom with Kitchenette", 
                     "King w/ Fireplace & Sofa-Bed", "2 Bedrooms with Full Kitchen", "Lake House"]
    # Convert date strings to required format
    start_date = datetime.strptime(start_date_str, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%m/%d/%y').strftime('%Y-%m-%d')
    
    # Prepare the request details
    url = f"https://secure.thinkreservations.com/api/hotels/3399/availabilities/v2?start_date={start_date}&end_date={end_date}&number_of_adults={num_travelers}&number_of_children=0&session_id=ad0b9271-17e5-46c8-9d5c-6f50ad3f938b"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://secure.thinkreservations.com",
        "Referer": "https://secure.thinkreservations.com/anchorinn/reservations/availability",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)"
    }

    
    # Send the request
    response = requests.post(url, headers=headers, data={})  # Sending an empty JSON object as payload

    if response.status_code == 200:
        units = response.json()
        for unit in units:
            name = unit["unit"]["name"]
            valid = (len(unit["validRateTypeAvailabilities"]) > 0)
            price = unit["rateTypeAvailabilities"][0]["averagePricePerDay"]
            if valid:
                stays[name] = price

        for stay in stays_ordered:
            if stays[stay] != "Unavailable":
                price = stays[stay]
                return {"available": True, "price": price, "message": "Available: $" + str(price) + " per night"}
            
        return {"available": False, "price": None, "message": "Not available for selected dates."}


    else:
        print(f"Failed to fetch data: {response.status_code}, {response.text}")
        return {"error": "Failed to retrieve data", "code": response.status_code}



def fetch_csrf_token(session, url):
    # Fetch the initial page to get the CSRF token and cookies
    response = session.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        token = soup.find('input', {'name': '__RequestVerificationToken'})
        return token['value'] if token else None
    return None

def scrape_traverseCityKoa_api(num_travelers, start_date_str, end_date_str):
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://koa.com",
        "Referer": "https://koa.com/campgrounds/traverse-city/reserve/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15"
    })

    token_url = "https://koa.com/campgrounds/traverse-city/reserve/"
    csrf_token = fetch_csrf_token(session, token_url)
    if not csrf_token:
        return "Failed to retrieve CSRF token"

    # Convert dates from string to datetime to match the required format
    start_date = datetime.strptime(start_date_str, "%m/%d/%y").strftime("%m/%d/%Y")
    end_date = datetime.strptime(end_date_str, "%m/%d/%y").strftime("%m/%d/%Y")

    # Update the payload with dynamic data and the CSRF token
    data = {
        "Reservation.SiteCategory": "A",
        "Reservation.CheckInDate": start_date,
        "Reservation.CheckOutDate": end_date,
        "Reservation.Adults": num_travelers,
        "Reservation.Kids": 0,
        "Reservation.Free": 0,
        "Reservation.Pets": "No",
        "Reservation.EquipmentType": "A",
        "Reservation.EquipmentLength": 0,
        "__RequestVerificationToken": csrf_token
    }

    # Post request to submit the reservation form
    response = session.post(token_url, data=data)
    if  response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.find_all('div', class_='row reserve-sitetype-main-row')
            results = []
            cheapest_price = 'Unavailable'
            for row in rows:
                title = row.find('h4', class_='reserve-sitetype-title').text.strip()
                price_span_element = row.find('div', class_='reserve-quote-per-night')
                if price_span_element and price_span_element.find('strong').find('span'):
                    price = price_span_element.find('span').text.strip().lstrip('$')
                    if cheapest_price == 'Unavailable' or float(price) < float(cheapest_price):
                        cheapest_price = price
                else:
                    price = 'Unavailable'
                results.append((title, price))

            if cheapest_price == 'Unavailable':
                return {"available": False, "price": None, "message": "Not available for selected dates."}
            else:
                return {"available": True, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}
            
    else:
        return f"Failed to fetch data: {response.status_code}, Reason: {response.reason}"
    

def write_response_to_file(html_content):
    with open("response.html", "w", encoding="utf-8") as file:
        file.write(html_content)

def main():
    traverseCityKoaData = scrape_traverseCityKoa_api(2, '08/20/24', '08/22/24')
    print(traverseCityKoaData)
    # timberRidgeData = scrape_timberRidge_api(5, '05/28/24', '05/30/24')
    # print(timberRidgeData)
    # anchorInnData = scrape_anchorInn_api(5, '05/28/24', '05/30/24')
    # print(anchorInnData)

if __name__ == '__main__':
    main()