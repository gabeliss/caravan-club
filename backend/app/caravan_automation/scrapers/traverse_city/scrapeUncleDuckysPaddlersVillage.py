import requests
from datetime import datetime
from bs4 import BeautifulSoup

def scrape_uncleducky_api(num_travelers, start_date_str, end_date_str):

    start_date = datetime.strptime(start_date_str, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date_str, '%m/%d/%y').strftime('%Y-%m-%d')


    url = 'https://paddlersvillage.checkfront.com/reserve/inventory/'

    params = {
        'inline': '1',
        'header': 'hide',
        'src': 'https://www.paddlingmichigan.com',
        'filter_category_id': '3,2,4,9',
        'ssl': '1',
        'provider': 'droplet',
        'filter_item_id': '',
        'customer_id': '',
        'original_start_date': '',
        'original_end_date': '',
        'date': '',
        'language': '',
        'cacheable': '1',
        'category_id': '2',
        'view': '',
        'start_date': start_date,
        'end_date': end_date,
        'keyword': '',
        'cf-month': start_date[:7].replace('-', '') + '01'
    }

    headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Host': 'paddlersvillage.checkfront.com',
        'Referer': 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15',
        'X-Requested-With': 'XMLHttpRequest'
    }

    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()
        inventory = data["inventory"]

        soup = BeautifulSoup(inventory, 'html.parser')
        
        unavailable = soup.find_all(string="Nothing available for the dates selected.")
        if unavailable:
            return {"available": False, "price": None, "message": "Not available for selected dates."}
        else:
            items = soup.find_all(class_="cf-item-data")
            price = '0'
            for item in items:
                item_summary = item.find(class_="cf-item-summary")
                p_tag_text = item_summary.get_text()

                if num_travelers > 5:
                    if "Sleeps 8" in p_tag_text:
                        item_price_span = item.find(class_="cf-price").strong.span
                        price = item_price_span.text.strip("$")
                        break
                else:
                    if "Sleeps 5" in p_tag_text:
                        item_price_span = item.find(class_="cf-price").strong.span
                        price = item_price_span.text.strip("$")
                        break
                        
            return {"available": True, "price": price, "message": "Available: $" + price + " per night"}

    else:
        print("Failed to retrieve data:", response.status_code)
        return {"error": "Failed to retrieve data", "code": response.status_code}



def main():
    uncleDuckyData = scrape_uncleducky_api(5, '06/08/25', '06/10/25')
    print(uncleDuckyData)


if __name__ == '__main__':
    main()