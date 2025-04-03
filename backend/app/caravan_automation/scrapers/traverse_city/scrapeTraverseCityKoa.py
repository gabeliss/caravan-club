from bs4 import BeautifulSoup
import requests
import time
import random
from requests.exceptions import RequestException
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# List of user agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
]

def scrape_traverseCityKoa_api(num_travelers, start_date, end_date, retry_count=0, max_retries=3):
    # Add delay with jitter to avoid predictable patterns (higher delay on retries)
    delay = (2 + retry_count * 3) + random.uniform(0.5, 1.5)
    time.sleep(delay)
    
    check_in_date = f"{start_date[:6]}20{start_date[6:]}"
    check_out_date = f"{end_date[:6]}20{end_date[6:]}"

    get_url = "https://koa.com/campgrounds/traverse-city/"

    # Rotate user agents
    user_agent = random.choice(USER_AGENTS)
    
    headers = {
        "User-Agent": user_agent,
        "Referer": "https://koa.com/campgrounds/traverse-city/",
        "Origin": "https://koa.com",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
    }

    session = requests.Session()

    try:
        logger.info(f"Making initial GET request (attempt {retry_count+1}/{max_retries+1})")
        response = session.get(get_url, headers=headers, timeout=10)
        response.raise_for_status() 

        soup = BeautifulSoup(response.text, 'html.parser')
        token = soup.find('input', {'name': '__RequestVerificationToken'})

        if token:
            token = token.get('value')
        else:
            logger.warning("Token not found in HTML. Check if the page structure has changed.")
            raise ValueError("Token not found in HTML. Check if the page structure has changed.")

        # Add a small delay between GET and POST
        time.sleep(1 + random.uniform(0.5, 1.0))

        post_url = "https://koa.com/campgrounds/traverse-city/reserve/"

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

        logger.info("Making POST request")
        post_response = session.post(post_url, headers=headers, data=data, timeout=10)

        if post_response.status_code == 200 and post_response.text:
            soup = BeautifulSoup(post_response.text, 'html.parser')
            
            # Check if we've been rate limited (looking for error message)
            error_msg = soup.find('div', class_='alert-danger')
            if error_msg and "rate limit" in error_msg.text.lower():
                logger.warning("Rate limit detected in response")
                if retry_count < max_retries:
                    logger.info(f"Retrying with exponential backoff ({retry_count+1}/{max_retries})")
                    return scrape_traverseCityKoa_api(num_travelers, start_date, end_date, 
                                                 retry_count=retry_count+1, max_retries=max_retries)
                else:
                    return {"available": False, "price": None, "message": "Rate limited after retries."}
            
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
        else:
            logger.warning(f"Unexpected status code: {post_response.status_code}")
            if retry_count < max_retries:
                return scrape_traverseCityKoa_api(num_travelers, start_date, end_date, 
                                             retry_count=retry_count+1, max_retries=max_retries)
            else:
                return {"available": False, "price": None, "message": f"Error: Status code {post_response.status_code}"}
    
    except (RequestException, ValueError, Exception) as e:
        logger.error(f"Error during scraping: {str(e)}")
        if retry_count < max_retries:
            logger.info(f"Retrying with exponential backoff ({retry_count+1}/{max_retries})")
            return scrape_traverseCityKoa_api(num_travelers, start_date, end_date, 
                                         retry_count=retry_count+1, max_retries=max_retries)
        else:
            return {"available": False, "price": None, "message": f"Error after retries: {str(e)}"}


def main():
    # Single request
    traverseCityKoaData = scrape_traverseCityKoa_api(2, '06/08/25', '06/10/25')
    print(traverseCityKoaData)

    # Multiple requests with proper delays
    for i in range(1, 5):  # Reduced from 100 to 5 for testing
        logger.info(f"Making request {i}")
        traverseCityKoaData = scrape_traverseCityKoa_api(2, '06/08/25', '06/10/25')
        print(traverseCityKoaData)
        
        # Additional delay between batches of requests
        time.sleep(random.uniform(10, 15))

if __name__ == '__main__':
    main()
