from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
import time


def scrape_uncleducky(num_travelers, start_date, end_date):
    url = 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com&1704390232826'

    webdriver_path = '../chromedriver'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument(f"executable_path={webdriver_path}")
    chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(1)

    try:
        start_date_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'cf-query-start_date'))
        )
        driver.execute_script("arguments[0].value = '';", start_date_input)
        start_date_input.send_keys(start_date)

        close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn'))
        )
        close_button.click()

        end_date_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'cf-query-end_date'))
        )
        driver.execute_script("arguments[0].value = '';", end_date_input)
        end_date_input.send_keys(end_date)

        close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn'))
        )
        close_button.click()

        yurt_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'cf-tab2'))
        )
        yurt_button.click()

        time.sleep(1)
        unavailable = driver.find_elements(By.XPATH, "//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]")
        if len(unavailable) > 0:
            returnData = {"available": False, "price": None, "message": "Not available for selected dates."}
            return returnData

        items = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, "cf-item-data"))
        )
    
        price = '0'

        for item in items:
            item_summary = item.find_element(By.CLASS_NAME, "cf-item-summary")
            p_tag_text = item_summary.find_element(By.TAG_NAME, "p").text
            
            if num_travelers > 5:
                if "Sleeps 8" in p_tag_text:
                    item_price_div = item.find_element(By.CLASS_NAME, "cf-item-title-summary")
                    item_price_strong = item_price_div.find_element(By.TAG_NAME, "strong")
                    item_price_span = item_price_strong.find_element(By.TAG_NAME, "span")
                    price = item_price_span.text.lstrip("$")
                    break
            else:
                if "Sleeps 5" in p_tag_text:
                    item_price_div = item.find_element(By.CLASS_NAME, "cf-item-title-summary")
                    item_price_strong = item_price_div.find_element(By.TAG_NAME, "strong")
                    item_price_span = item_price_strong.find_element(By.TAG_NAME, "span")
                    price = item_price_span.text.lstrip("$")
                    break

    except TimeoutException as e:
        print(f"Timed out waiting for element: {e}")
        price = None

    finally:
        driver.quit()

    returnData = {"available": True, "price": price, "message": "Available: $" + price + " per night"}
    return returnData