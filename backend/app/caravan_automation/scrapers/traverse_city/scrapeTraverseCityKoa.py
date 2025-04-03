from bs4 import BeautifulSoup
import requests
from datetime import datetime

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
    # works one time
    traverseCityKoaData = scrape_traverseCityKoa_api(2, '06/08/25', '06/10/25')
    print(traverseCityKoaData)

    # rate limited
    for i in range(1, 100):
        traverseCityKoaData = scrape_traverseCityKoa_api(2, '06/08/25', '06/10/25')
        print(traverseCityKoaData)

    print(i)
 
 
if __name__ == '__main__':
     main()