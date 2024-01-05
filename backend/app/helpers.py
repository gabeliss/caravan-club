from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
import time


def scrape_price():
    url = 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com&1704390232826'
    webdriver_path = '../chromedriver'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument(f"executable_path={webdriver_path}")
    chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(0.5)

    try:
        start_date_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'cf-query-start_date'))
        )
        driver.execute_script("arguments[0].value = '';", start_date_input)
        start_date_input.send_keys('06/01/24')

        close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn'))
        )
        close_button.click()

        end_date_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'cf-query-end_date'))
        )
        driver.execute_script("arguments[0].value = '';", end_date_input)
        end_date_input.send_keys('06/03/24')

        close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn'))
        )
        close_button.click()

        first_book_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'cf-btn-book'))
        )
        first_book_button.click()

        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'sub_btn'))
        )
        submit_button.click()

        price_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'cf-tally-metadata'))
        )
        price = price_element.get_attribute('data-total')

    except TimeoutException as e:
        print(f"Timed out waiting for element: {e}")
        price = None

    finally:
        driver.quit()

    return price