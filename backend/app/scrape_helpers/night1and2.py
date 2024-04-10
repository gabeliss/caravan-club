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
        WebDriverWait(driver, 10).until(EC.invisibility_of_element((By.ID, 'newbook_loading_overlay')))
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
    timberRidgeData = scrape_timberRidge(5, '06/01/24', '06/02/24')
    print(timberRidgeData)


if __name__ == '__main__':
    main()