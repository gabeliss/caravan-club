from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
import time


def scrape_uncleducky(url):
    webdriver_path = '../chromedriver'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument(f"executable_path={webdriver_path}")
    # chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(1)

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

        # get price

        price_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'cf-tally-metadata'))
        )
        price = price_element.get_attribute('data-total')
        print(price)

        # fill out customer info
        customer_name_input = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'customer_name'))
        )
        customer_name_input.clear()  # Clear existing text, if any
        customer_name_input.send_keys('Joe Smith')

        customer_email_input = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'customer_email'))
        )
        customer_email_input.clear()
        customer_email_input.send_keys('joesmith@gmail.com')

        customer_phone_input = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'customer_phone'))
        )
        customer_phone_input.clear()
        customer_phone_input.send_keys('2481231234')

        # Click the checkbox for customer_tos_agree
        checkbox_label = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'label.btn.btn-checkbox[for="customer_tos_agree"]'))
        )
        checkbox_label.click()

        # Click the submit button
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'continue'))
        )
        submit_button.click()

    except TimeoutException as e:
        print(f"Timed out waiting for element: {e}")
        price = None

    finally:
        driver.quit()

    return price


def main():
    iframeurl = 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com&1704390232826'
    price = scrape_uncleducky(iframeurl)
    print(price)


if __name__ == '__main__':
    main()