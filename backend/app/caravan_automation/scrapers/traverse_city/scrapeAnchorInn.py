from datetime import datetime
import requests

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
             valid = (len(unit["validRateTypeAvailabilities"]) > 0 or len(unit["rateTypeAvailabilities"]) > 0)
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
 
 
 
def main():
    anchorInnData = scrape_anchorInn_api(5, '06/08/25', '06/10/25')
    print(anchorInnData)

if __name__ == '__main__':
    main()