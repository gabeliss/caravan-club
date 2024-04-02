from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
import time

months_dict = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
}

def scrape_uncleducky(num_travelers, start_date, end_date):
    url = 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com&1704390232826'

    webdriver_path = '../chromedriver'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument(f"executable_path={webdriver_path}")
    #chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(1)

    try:
        start_date_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'cf-query-start_date')))
        driver.execute_script("arguments[0].value = '';", start_date_input)
        start_date_input.send_keys(start_date)

        close_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn')))
        close_button.click()

        end_date_input = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'cf-query-end_date')))
        driver.execute_script("arguments[0].value = '';", end_date_input)
        end_date_input.send_keys(end_date)

        close_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'input-group-btn.date_btn')))
        close_button.click()

        yurt_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'cf-tab2')))
        driver.execute_script("arguments[0].scrollIntoView();", yurt_button)
        try:
            ActionChains(driver).move_to_element(yurt_button).click(yurt_button).perform()
        except Exception as action_chain_exception:
            # Fallback to JavaScript click if ActionChains fails
            print(f"ActionChains exception: {action_chain_exception}. Falling back to JavaScript click.")
            driver.execute_script("arguments[0].click();", yurt_button)

        time.sleep(1)
        unavailable = driver.find_elements(By.XPATH, "//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]")
        if len(unavailable) > 0:
            returnData = {"available": False, "price": None, "message": "Not available for selected dates."}
            return returnData

        items = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "cf-item-data")))
    
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


def scrape_timberRidge(num_travelers, start_date, end_date):
    url = 'https://bookingsus.newbook.cloud/timberridgeresort/index.php'

    webdriver_path = '../chromedriver'
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument(f"executable_path={webdriver_path}")
    chrome_options.add_argument('--headless')

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(url)
    time.sleep(1)

    try:
        body = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'newbook_content')))
        date_picker_button = body.find_element(By.CLASS_NAME, 'newbook_responsive_button')

        date_picker_button.click()

        start_month = start_date[0:2]
        end_month = end_date[0:2]
        start_day = start_date[3:5].lstrip('0')
        end_day = end_date[3:5].lstrip('0')

        left_month_container = body.find_element(By.CLASS_NAME, "newbook-daterange-left")
        left_month_text = left_month_container.find_element(By.CLASS_NAME, "newbook-month").text.split(' ')[0]
        selected_start_month = None
        selected_end_month = None
        for i in range(12):
            if i == 0 and months_dict[start_month] == left_month_text:
                selected_start_month = left_month_container
                if start_month != end_month:
                    selected_end_month = body.find_element(By.CLASS_NAME, "newbook-daterange-right")
                break

            right_month_container = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'newbook-daterange-right')))
            right_month_text = right_month_container.find_element(By.CLASS_NAME, "newbook-month").text.split(' ')[0]
            if months_dict[start_month] == right_month_text:
                if start_month != end_month:
                    next_month_button = right_month_container.find_element(By.CLASS_NAME, "newbook-next")
                    next_month_button.click()
                    selected_start_month = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'newbook-daterange-left')))
                else:
                    selected_start_month = right_month_container
                break
            else:
                next_month_button = right_month_container.find_element(By.CLASS_NAME, "newbook-next")
                next_month_button.click()

        index = 0 if int(start_day) < 25 else -1
        selected_start_day = selected_start_month.find_elements(By.XPATH, f".//table/tbody//td[normalize-space(text()) = '{start_day}']")[index]
        selected_start_day.click()

        index = 0 if int(end_day) < 25 else -1
        selected_end_month = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'newbook-daterange-right')))
        selected_end_day = selected_end_month.find_elements(By.XPATH, f".//table/tbody//td[normalize-space(text()) = '{end_day}']")[index]
        selected_end_day.click()
        time.sleep(3)
        returnData = {"available": False, "price": None, "message": "Not available for selected dates."}

        page_container = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'category-list')))
        yurt_basic_container = page_container.find_element(By.XPATH, ".//div[contains(@class, 'newbook_online_category_details') and .//a[contains(text(), 'Yurt Basic')]]")
        yurt_basic_price_span = yurt_basic_container.find_elements(By.CLASS_NAME, "newbook_online_from_price_text")
        yurt_deluxe_container = page_container.find_element(By.XPATH, ".//div[contains(@class, 'newbook_online_category_details') and .//a[contains(text(), 'Yurt Deluxe')]]")
        yurt_deluxe_price_span = yurt_deluxe_container.find_elements(By.CLASS_NAME, "newbook_online_from_price_text")

        if yurt_basic_price_span:
            price = yurt_basic_price_span[0].text.lstrip("$")
            returnData = {"available": True, "price": price, "message": "Available: $" + price + " per night"}
        elif yurt_deluxe_price_span:
            price = yurt_deluxe_price_span[0].text.lstrip("$")
            returnData = {"available": True, "price": price, "message": "Available: $" + price + " per night"}

    except TimeoutException as e:
        print(f"Timed out waiting for element: {e}")
        driver.quit()
        return None

    finally:
        driver.quit()

    return returnData


def main():
    uncleDuckyData = scrape_uncleducky(5, '06/01/24', '06/02/24')
    print(uncleDuckyData)
    timberRidgeData = scrape_timberRidge(4, '05/28/24', '05/30/24')
    print(timberRidgeData)


if __name__ == '__main__':
    main()