from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def pay_uncleDuckysTent(start_date, end_date, num_adults, num_kids, payment_info):
    # Check if total number of people exceeds 5
    if int(num_adults) + int(num_kids) > 5:
        return False

    # Check if start date is before May 23, 2025
    start_date_obj = datetime.strptime(start_date, "%m/%d/%y")
    if start_date_obj < datetime(2025, 5, 23):
        return False
    # Convert dates to the required format (YYYY-MM-DD)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%Y-%m-%d")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")

    url = f'https://paddlersvillage.checkfront.com/reserve/?start_date={start_date_formatted}&end_date={end_date_formatted}&category_id=4'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            unavailable = page.query_selector("//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]")
            if unavailable:
                print('Unavailable, returning False')
                return {"available": False, "price": None, "message": "No options available."}

            first_option = page.query_selector_all('.cf-item-data')[0]
            if first_option:
                price_element = first_option.query_selector(".cf-price strong")
                if price_element:
                    book_button = first_option.query_selector('.cf-btn-book')
                    book_button.click()

                    modal = page.wait_for_selector('.modal-content', timeout=10000)
                    continue_button = modal.query_selector('#sub_btn')
                    continue_button.click()

                    form = page.wait_for_selector('#cf-form', timeout=10000)

                    customer_name_input = form.query_selector('#customer_name')
                    customer_name_input.fill(payment_info["first_name"] + " " + payment_info["last_name"])
                    page.wait_for_timeout(500)
                    customer_email_input = form.query_selector('#customer_email')
                    customer_email_input.fill(payment_info["email"])
                    page.wait_for_timeout(500)
                    customer_phone_input = form.query_selector('#customer_phone')
                    customer_phone_input.fill(payment_info["phone_number"])

                    checkbox = form.query_selector('.btn-checkbox')
                    checkbox.click()

                    continue_button = form.query_selector('#continue')
                    continue_button.click()

                    cardholder_name_input = page.wait_for_selector("#card-name", timeout=10000)
                    cardholder_name_input.fill(payment_info["cardholder_name"])

                    card_number_iframe_element = page.wait_for_selector('#card-number iframe[title="Secure card number input frame"]', timeout=10000)
                    card_number_iframe = card_number_iframe_element.content_frame()
                    card_number_input = card_number_iframe.query_selector('input[name="cardnumber"]')
                    card_number_input.fill(payment_info["card_number"])

                    card_expiry_iframe_element = page.wait_for_selector('#card-expiry iframe[title="Secure expiration date input frame"]', timeout=10000)
                    card_expiry_iframe = card_expiry_iframe_element.content_frame()
                    card_expiry_input = card_expiry_iframe.query_selector('input[name="exp-date"]')
                    card_expiry_input.fill(payment_info["expiry_date"])

                    card_cvc_iframe_element = page.wait_for_selector('#card-cvc iframe[title="Secure CVC input frame"]', timeout=10000)
                    card_cvc_iframe = card_cvc_iframe_element.content_frame()
                    card_cvc_input = card_cvc_iframe.query_selector('input[name="cvc"]')
                    card_cvc_input.fill(payment_info["cvc"])

                    pay_button = page.query_selector("#process")
                    # uncomment to pay
                    # pay_button.click()
                    # time.sleep(5)
                    back_button = page.query_selector("#back-to-reserve")
                    back_button.click()
                    clear_button = page.query_selector("#clear-pre")
                    clear_button.click()
                    clear_button.click()
                    return True
                else:
                    print("No price found, investigating further")
                    return False
            else:
                print("No first option found, investigating further")
                return False
            

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"available": False, "price": None, "message": f"Error: {str(e)}"}

        finally:
            browser.close()


def main():
    payment_info = {
        "first_name": "Lebron",
        "last_name": "James",
        "email": "lebronjames@gmail.com",
        "phone_number": "3134321234",
        "street_address": "1234 Rocky Rd",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "45445",
        "country": "USA",
        "cardholder_name": "Lebron James",
        "card_number": "2342943844322224",
        "card_type": "Visa",
        "expiry_date": "01/30",
        "cvc": "1234"
    }
    uncleDuckysData = pay_uncleDuckysTent('06/23/25', '06/25/25', 2, 1, payment_info)
    print(uncleDuckysData)

if __name__ == '__main__':
    main()