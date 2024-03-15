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
        end_date_input.send_keys('06/02/24')

        close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn'))
        )
        close_button.click()
        #click yurts
        yurt_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, 'cf-tab2'))
        )
        yurt_button.click()

        items = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, "cf-item-data"))
        )
    
        # Iterate over the items
        for item in items:
            # Find the <p> tag within the item's summary
            item_summary = item.find_element(By.CLASS_NAME, "cf-item-summary")
            p_tag_text = item_summary.find_element(By.TAG_NAME, "p").text
            
            # Check if the <p> tag text contains "Sleeps 8"
            if "Sleeps 5" in p_tag_text:
                # Find and click the book button
                book_button = item.find_element(By.CLASS_NAME, "cf-btn-book")
                book_button.click()

                break

        # get price

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