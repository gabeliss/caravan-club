from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
from playwright.sync_api import sync_playwright
import time

def pay_uncleducky_api(num_travelers, start_date, end_date, place_name, payment_info):
    url = 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com&1704390232826'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            # Enter start date
            start_date_input = page.wait_for_selector('#cf-query-start_date', timeout=10000)
            start_date_input.fill('')
            start_date_input.fill(start_date)
            start_date_input.press('Enter')

            # Enter end date
            end_date_input = page.wait_for_selector('#cf-query-end_date', timeout=10000)
            end_date_input.fill('')
            end_date_input.fill(end_date)
            end_date_input.press('Enter')

            # Click on the yurt tab
            yurt_button = page.wait_for_selector('#cf-tab2', timeout=10000)
            yurt_button.click()

            time.sleep(1)

            # Check if no availability message is present
            unavailable = page.query_selector("//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]")
            if unavailable:
                returnData = {"available": False, "price": None, "message": "Not available for selected dates."}
                return returnData

            # Find all items
            items = page.query_selector_all('.cf-item-data')

            price = '0'

            for item in items:
                name = item.query_selector(".cf-title h2").text_content().strip().replace('\t', '').strip('.')
                if name == place_name:
                    book_button = item.query_selector(".cf-btn-book")
                    book_button.click()

                    modal = page.wait_for_selector('.modal-content', timeout=10000)
                    continue_button = modal.query_selector('#sub_btn')
                    continue_button.click()

                    form = page.wait_for_selector('#cf-form', timeout=10000)

                    customer_name_input = form.query_selector('#customer_name')
                    customer_name_input.fill(payment_info["name"])
                    customer_email_input = form.query_selector('#customer_email')
                    customer_email_input.fill(payment_info["email"])
                    customer_phone_input = form.query_selector('#customer_phone')
                    customer_phone_input.fill(payment_info["phone_number"])

                    checkbox = form.query_selector('.btn-checkbox')
                    checkbox.click()

                    continue_button = form.query_selector('#continue')
                    continue_button.click()

                    card_number_iframe_element = page.wait_for_selector('#card-number iframe[title="Secure card number input frame"]', timeout=10000)
                    card_number_iframe = card_number_iframe_element.content_frame()
                    card_number_input = card_number_iframe.query_selector('input[name="cardnumber"]')
                    card_number_input.fill(payment_info["card_number"])

                    card_expiry_iframe_element = page.wait_for_selector('#card-expiry iframe[title="Secure expiration date input frame"]', timeout=10000)
                    card_expiry_iframe = card_expiry_iframe_element.content_frame()
                    card_expiry_input = card_expiry_iframe.query_selector('input[name="exp-date"]')
                    card_expiry_input.fill(payment_info["expiry_date"])

                    # Switch to the CVC iframe and fill in the CVC
                    card_cvc_iframe_element = page.wait_for_selector('#card-cvc iframe[title="Secure CVC input frame"]', timeout=10000)
                    card_cvc_iframe = card_cvc_iframe_element.content_frame()
                    card_cvc_input = card_cvc_iframe.query_selector('input[name="cvc"]')
                    card_cvc_input.fill(payment_info["cvc"])

                    pay_button = page.query_selector("#process")
                    # uncomment to pay
                    # pay_button.click()
                    back_button = page.query_selector("#back-to-reserve")
                    back_button.click()
                    clear_button = page.query_selector("#clear-pre")
                    clear_button.click()
                    clear_button.click()


        except Exception as e:
            print(f"An error occurred: {e}")
            price = None

        finally:
            browser.close()

    returnData = {"available": True, "price": price, "message": "Available: $" + price + " per night"}
    return returnData


def main():
    payment_info = {
        "name": "Lebron James",
        "email": "lebronjames@gmail.com",
        "phone_number": "3134321234",
        "card_number": "123412345612345",
        "expiry_date": "0130",
        "cvc": "1234"
    }
    uncleDuckyData = pay_uncleducky_api(4, '08/24/24', '08/26/24', '#32 Yurt: Wolf (Paddlers Village)', payment_info)
    print(uncleDuckyData)


if __name__ == '__main__':
    main()