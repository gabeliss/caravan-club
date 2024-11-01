import requests
import os
import json


def get_initial_cookies(url):
    session = requests.Session()
    session.get(url)
    return session


def scrape_teePeeCampgroundTent(start_date, end_date, num_adults, num_kids):

    file_path = os.path.join(os.path.dirname(__file__), "date_to_pk_mapping.json")

    with open(file_path, "r") as f:
        date_to_pk_dict = json.load(f)
    
    pk = date_to_pk_dict.get(start_date)

    url = f"https://fareharbor.com/api/v1/companies/teepeecampground/total-sheets/238778/pricing/Availability/{pk}/"

    session = get_initial_cookies(url)
    
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "max-age=0",
        "Referer": f"https://fareharbor.com/embeds/book/teepeecampground/items/74239/calendar/20{start_date[6:8]}/{start_date[0:2]}/{start_date[3:5]}/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Upgrade-Insecure-Requests": "1",
    }
    
    csrf_token = session.cookies.get("csrftoken")
    if csrf_token:
        headers["X-CSRFTOKEN"] = csrf_token
    
    
    try:
        response = session.get(url, headers=headers)
        response.raise_for_status() 
        data = response.json() 
        # Revisit when site is populated
        print("Site is not populated yet.")
        return {"available": False, "price": None, "message": "Site is not populated yet."}
    except requests.RequestException as e:
        print("Failed to retrieve data:", response)
        return {"available": False, "price": None, "message": "Failed to retrieve data"}


def main():
    teePeeCampgroundData = scrape_teePeeCampgroundTent('05/15/25', '05/17/25', 2, 1)
    print(teePeeCampgroundData)

if __name__ == '__main__':
    main()
