from datetime import datetime
from playwright.sync_api import sync_playwright
import time

def pay_anchorInn_api(num_travelers, start_date, end_date, place_name, payment_info):

    def convert_date(date_str):
        return datetime.strptime(date_str, '%m/%d/%y').strftime('%m/%d/%Y')

    # Convert the dates
    start_date = convert_date(start_date)
    end_date = convert_date(end_date)

    url = 'https://secure.thinkreservations.com/anchorinn/reservations/availability'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            # Enter check in, check out, guests
            check_in_input = page.wait_for_selector('#check-availability-startDate_input', timeout=10000)
            check_in_input.fill('')
            check_in_input.fill(start_date)
            check_in_input.press('Enter')

            check_out_input = page.wait_for_selector('#check-availability-endDate_input', timeout=10000)
            check_out_input.fill('')
            check_out_input.fill(end_date)
            check_out_input.press('Enter')

            guests_select = page.wait_for_selector('#number-of-guests', timeout=10000)
            guests_select.select_option(value=str(num_travelers))

            update_button = page.wait_for_selector('.search', timeout=10000)
            update_button.click()

            time.sleep(1)

            # find correct place and click 'Add to reservation'
            units = page.query_selector_all('.unit-option-inner-wrapper')
            for unit in units:
                unit_name = unit.query_selector('h2.unit-name').inner_text()
                if unit_name == place_name:
                    add_to_reservation_div = unit.query_selector('.add-to-reservation')
                    add_to_reservation_button = add_to_reservation_div.query_selector('button')
                    add_to_reservation_button.click()
                    time.sleep(1)

                    continue_button = page.wait_for_selector('.continue', timeout=10000)
                    continue_button.click()
                    time.sleep(1)

                    # fill out payment info
                    first_name_input = page.wait_for_selector('#first-name', timeout=10000)
                    first_name_input.fill(payment_info["first_name"])

                    last_name_input = page.wait_for_selector('#last-name', timeout=10000)
                    last_name_input.fill(payment_info["last_name"])

                    phone_input = page.wait_for_selector('#cell-phone', timeout=10000)
                    phone_input.fill(payment_info["phone_number"])

                    email_input = page.wait_for_selector('#email', timeout=10000)
                    email_input.fill(payment_info["email"])

                    arrival_time_select = page.wait_for_selector('#custom-attribute-__ARRIVAL_TIME_CUSTOM_ATTRIBUTE__', timeout=10000)
                    arrival_time_select.select_option(value="4:00 PM")

                    card_name_input = page.wait_for_selector('#cardholder-name', timeout=10000)
                    card_name_input.fill(payment_info["cardholder_name"])

                    card_number_input = page.wait_for_selector('#card-number', timeout=10000)
                    card_number_input.fill(payment_info["card_number"])

                    expiry_month = payment_info["expiry_date"][0:2]
                    expiry_year = "20" + payment_info["expiry_date"][3:]
                    expiry_month_select = page.wait_for_selector('#expiration-month', timeout=10000)
                    expiry_month_select.select_option(value=expiry_month)
                    expiry_year_select = page.wait_for_selector('#expiration-year', timeout=10000)
                    expiry_year_select.select_option(value=expiry_year)

                    cvc_input = page.wait_for_selector('#cvv', timeout=10000)
                    cvc_input.fill(payment_info["cvc"])

                    street_address_input = page.wait_for_selector('#street-address', timeout=10000)
                    street_address_input.fill(payment_info["street_address"])

                    city_input = page.wait_for_selector('#locality', timeout=10000)
                    city_input.fill(payment_info["city"])

                    state_input = page.wait_for_selector('#region', timeout=10000)
                    state_input.fill(payment_info["state"])

                    zip_code_input = page.wait_for_selector('#postal-code', timeout=10000)
                    zip_code_input.fill(payment_info["zip_code"])

                    terms_and_conditions_input = page.wait_for_selector('#accepted-terms-and-conditions', timeout=10000)
                    terms_and_conditions_input.click()

                    # uncomment to pay
                    confirm_reservation_button = page.wait_for_selector('.confirm-reservation', timeout=10000)
                    # confirm_reservation_button.click()
                    # time.sleep(5)
                    return True

            
            print("Place name was not found. This should not happen. Investigate further.")
            return False


        except Exception as e:
            print(f"An error occurred: {e}")
            return False

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
        "card_number": "123412345612345",
        "expiry_date": "01/30",
        "cvc": "1234"
    }
    anchorInnData = pay_anchorInn_api(4, '08/21/24', '08/23/24', '1 Bedroom with Kitchenette', payment_info)
    print(anchorInnData)


if __name__ == '__main__':
    main()