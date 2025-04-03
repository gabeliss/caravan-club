from bs4 import BeautifulSoup
import requests

def scrape_stIgnaceKoa_api(num_travelers, start_date, end_date):
    check_in_date = f"{start_date[:6]}20{start_date[6:]}"
    check_out_date = f"{end_date[:6]}20{end_date[6:]}"

    get_url = "https://koa.com/campgrounds/st-ignace/"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
        "Referer": "https://koa.com/campgrounds/st-ignace/",
        "Origin": "https://koa.com"
    }

    session = requests.Session()

    response = session.get(get_url, headers=headers)
    response.raise_for_status() 

    soup = BeautifulSoup(response.text, 'html.parser')
    token = soup.find('input', {'name': '__RequestVerificationToken'})

    if token:
        token = token.get('value')
    else:
        raise ValueError("Token not found in HTML. Check if the page structure has changed.")

    post_url = "https://koa.com/campgrounds/st-ignace/reserve/"

    data = {
        "Reservation.SiteCategory": "A",
        "Reservation.CheckInDate": check_in_date,
        "Reservation.CheckOutDate": check_out_date,
        "Reservation.Adults": str(num_travelers),
        "Reservation.Kids": "0",
        "Reservation.Free": "0",
        "Reservation.Pets": "No",
        "Reservation.EquipmentType": "A",
        "Reservation.EquipmentLength": "0",
        "__RequestVerificationToken": token
    }

    post_response = session.post(post_url, headers=headers, data=data)

    if post_response.status_code == 200 and post_response.text:
        soup = BeautifulSoup(post_response.text, 'html.parser')
        containers = soup.find_all('div', class_='reserve-sitetype-main-row')
        available = False
        cheapest_price = 1000000
        cheapest_name = "placeholder"
        for container in containers:
            name = container.find('h4', class_='reserve-sitetype-title').text
            price_container = container.find('div', class_='reserve-quote-per-night')
            if price_container:
                price = float(price_container.find('strong').find('span').text.lstrip('$').split(' ')[0])
                if price < cheapest_price:
                    cheapest_price = price
                    available = True
                    cheapest_name = name
            else:
                break
        
        if available:
            return {"available": True, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}
        else:
            return {"available": False, "price": None, "message": "Not available for selected dates."}
        
def main():
    # works one time
    stIgnaceKoaData = scrape_stIgnaceKoa_api(2, '06/08/25', '06/10/25')
    print(stIgnaceKoaData)

    # rate limited
    for i in range(1, 100):
        stIgnaceKoaData = scrape_stIgnaceKoa_api(2, '06/08/25', '06/10/25')
        print(stIgnaceKoaData)

    print(i)

if __name__ == '__main__':
    main()
