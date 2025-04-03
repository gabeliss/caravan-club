from bs4 import BeautifulSoup
import requests
from datetime import datetime

def scrape_cabinsOfMackinaw_api(num_travelers, start_date_str, end_date_str):
 
    session = requests.Session()
    session.get("https://ssl.mackinaw-city.com/newreservations/request.php?HotelId=13")

    url = "https://ssl.mackinaw-city.com/newreservations/request.php"

    cookie = session.cookies._cookies['ssl.mackinaw-city.com']['/']['PHPSESSID'].value

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
        'Cookie': 'PHPSESSID=' + cookie,
        'Host': 'ssl.mackinaw-city.com',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }

    session.headers.update(headers)

    start_date = datetime.strptime(start_date_str, '%m/%d/%y')
    end_date = datetime.strptime(end_date_str, '%m/%d/%y')

    params = {
        'roomtype': 7,
        'selectdate': start_date.strftime('%m-%d-%Y'),
        'dayspan': 2,
        'numberrooms': 1,
        'numberguests': num_travelers,
        'ratetype': 'Internet Special',
        'submit_x': 'true'
    }

    response = session.get(url, headers=headers, params=params)

    if response.status_code == 200 and response.text:
        soup = BeautifulSoup(response.text, 'html.parser')

        cabins_data = {}
        
        table = soup.find_all('table', class_='data')[1]
        
        if table:
            tbody = table.find('tbody')
            
            if tbody:
                for row in tbody.find_all('tr'):
                    a_tag = row.find('a')
                    span_tag = row.find('span')
                    
                    if a_tag and span_tag:
                        title = a_tag.text.strip()
                        price = span_tag.text.strip()

                        cabins_data[title] = price
        
            pc1 = 'Private Chalet - 1 Room Queen Bed'
            pc2 = 'Private Chalet - 1 Room 2 Queen Beds'
            pc3 = 'Private Chalet - 2 Rooms, 2 Queen Beds and 2 TVs'
            pc4 = 'Private Chalet - 3 Rooms, 2 Queen beds, Sofabed in Living Area, 2 TVs'
            available = True
            price = -1
            if num_travelers <= 2:
                if pc1 in cabins_data and cabins_data[pc1] != 'not available':
                    price = cabins_data[pc1]
                else:
                    available = False
            elif num_travelers <= 4:
                if pc2 in cabins_data and cabins_data[pc2] != 'not available':
                    price = cabins_data[pc2]
                elif pc3 in cabins_data and cabins_data[pc3] != 'not available':
                    price = cabins_data[pc3]
                else:
                    available = False
            elif num_travelers <= 6:
                if pc4 in cabins_data and cabins_data[pc4] != 'not available':
                    price = cabins_data[pc4]
                else:
                    available = False 
            else:
                available = False 

            if available:
                price = price.strip("$")
                return {"available": True, "price": price, "message": "Available: $" + price + " per night"}
            else:
                return {"available": False, "price": None, "message": "Not available for selected dates."}              

    else:
        print("Failed to retrieve data, or data is empty.")

def main():
    cabinsOfMackinacData = scrape_cabinsOfMackinaw_api(2, '06/08/25', '06/10/25')
    print(cabinsOfMackinacData)

if __name__ == '__main__':
    main()
