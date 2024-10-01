from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def pay_timberRidgeTent(start_date, end_date, num_adults, num_kids, payment_info):
    # Convert dates to the required format (DD-MM-YY)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%d-%m-%y")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%d-%m-%y")

    url = f"https://bookingsus.newbook.cloud/timberridgeresort/index.php?available_from={start_date_formatted}&available_to={end_date_formatted}&adults={num_adults}&kids={num_kids}&equipment_type=3&equipment_length=20"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            page.wait_for_selector('#category-list')

            first_option = page.query_selector('.newbook_online_category_box')

            if first_option:
                price_element = first_option.query_selector('.newbook_online_from_price_text')

                if price_element:
                    price = price_element.inner_text()
                    book_button = first_option.query_selector('button.button.newbook_responsive_button.full_width_uppercase')
                    if book_button:
                        book_button.click()
                        time.sleep(2)

                        main_container = page.locator('#newbook_content')
                        main_container.wait_for(state='visible', timeout=5000)
                        child_container = page.locator('.newbook_online_footer')
                        child_container.wait_for(state='visible', timeout=5000)
                        next_step_button = child_container.locator('button#generic_button_3')
                        next_step_button.wait_for(state='visible', timeout=5000)
                        next_step_button.click()
                        time.sleep(1)

                        # fill out payment info
                        main_container = page.locator('#newbook_content')
                        main_container.wait_for(state='visible', timeout=5000)

                        newbook_row = main_container.locator('.newbook-row').nth(1)

                        first_name_input = newbook_row.locator('#firstname')
                        first_name_input.wait_for(state='visible', timeout=5000)
                        first_name_input.fill(payment_info['first_name'])

                        last_name_input = newbook_row.locator('#lastname')
                        last_name_input.wait_for(state='visible', timeout=5000)
                        last_name_input.fill(payment_info['last_name'])

                        email_input = newbook_row.locator('#contact_details_email')
                        email_input.wait_for(state='visible', timeout=5000)
                        email_input.fill(payment_info['email'])

                        address_input = newbook_row.locator('#google_address_lookup')
                        address_input.wait_for(state='visible', timeout=5000)
                        address_input.fill(payment_info['street_address'])

                        city_input = newbook_row.locator('#city')
                        city_input.wait_for(state='visible', timeout=5000)
                        city_input.fill(payment_info['city'])

                        zip_code_input = newbook_row.locator('#postcode')
                        zip_code_input.wait_for(state='visible', timeout=5000)
                        zip_code_input.fill(payment_info['zip_code'])

                        newbook_row = main_container.locator('#newbook_payment_method_options')
                        newbook_row.wait_for(state='visible', timeout=5000)

                        card_number_input = newbook_row.locator('#card_number')
                        card_number_input.wait_for(state='visible', timeout=5000)
                        card_number_input.fill(payment_info['card_number'])

                        card_expiry_input = newbook_row.locator('#card_expiry')
                        card_expiry_input.wait_for(state='visible', timeout=5000)
                        card_expiry_input.fill(payment_info['expiry_date'])

                        card_cvv_input = newbook_row.locator('#card_cvv')
                        card_cvv_input.wait_for(state='visible', timeout=5000)
                        card_cvv_input.fill(payment_info['cvc'])

                        card_name_input = newbook_row.locator('#card_name')
                        card_name_input.wait_for(state='visible', timeout=5000)
                        card_name_input.fill(payment_info['cardholder_name'])

                        agree_checkbox = main_container.locator('#agree')
                        agree_checkbox.wait_for(state='visible', timeout=5000)
                        agree_checkbox.click()

                        place_booking_button = main_container.locator('#place_booking_full')
                        place_booking_button.wait_for(state='visible', timeout=5000)
                        # uncomment to pay
                        # place_booking_button.click()
                        # time.sleep(2)

                        return True 
                    else:
                        print("Book button not found. This should not happen. Investigate further.")
                        return False
                else:
                    print("price_element not found. This should not happen. Investigate further.")
                    return False
            else:
                print("first_option not found. This should not happen. Investigate further.")
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
    timberRidgeData = pay_timberRidgeTent('10/01/24', '10/03/24', 3, 1, payment_info)
    print(timberRidgeData)

if __name__ == '__main__':
    main()