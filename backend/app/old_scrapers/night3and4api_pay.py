from playwright.sync_api import sync_playwright
import time

def pay_cabinsOfMackinaw_api(num_travelers, start_date, end_date, place_name, payment_info):
    url = 'https://ssl.mackinaw-city.com/newreservations/request.php?HotelId=13'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            # Enter room type
            room_type_select = page.wait_for_selector('#roomtype', timeout=10000)
            room_type_select.select_option(label=place_name)

            # Enter date of arrival
            start_date_with_dashes = start_date.replace("/", "-")
            date_of_arrival_input = page.wait_for_selector('#checkin', timeout=10000)
            date_of_arrival_input.fill('')
            date_of_arrival_input.fill(start_date_with_dashes)

            # Click on page to close it
            random_click = page.wait_for_selector('#content', timeout=10000)
            random_click.click()

            # Enter nights staying
            nights_staying_select = page.wait_for_selector('select[name="dayspan"]', timeout=10000)
            nights_staying_select.select_option(value="2")

            # Click on check rates button
            check_rates_button = page.wait_for_selector('#sub_button', timeout=10000)
            check_rates_button.click()

            time.sleep(1)

            # Click on continue button
            continue_button = page.wait_for_selector('#sub_button', timeout=10000)
            continue_button.click()

            time.sleep(1)

            # Click on skip packages button
            skip_packages_button = page.wait_for_selector('#sub_button', timeout=10000)
            skip_packages_button.click()

            time.sleep(1)

            # Click on continue button
            continue_button = page.wait_for_selector('#sub_button2', timeout=10000)
            continue_button.click()

            time.sleep(1)

            # fill out payment info
            first_name_input = page.wait_for_selector('input[name="firstname"]', timeout=10000)
            first_name_input.fill(payment_info["first_name"])

            last_name_input = page.wait_for_selector('input[name="lastname"]', timeout=10000)
            last_name_input.fill(payment_info["last_name"])

            phone_number_input = page.wait_for_selector('input[name="phone"]', timeout=10000)
            phone_number_input.fill(payment_info["phone_number"])

            email_input = page.wait_for_selector('input[name="email"]', timeout=10000)
            email_input.fill(payment_info["email"])

            street_address_input = page.wait_for_selector('input[name="address"]', timeout=10000)
            street_address_input.fill(payment_info["street_address"])

            city_input = page.wait_for_selector('input[name="city"]', timeout=10000)
            city_input.fill(payment_info["city"])

            state_input = page.wait_for_selector('select[name="state"]', timeout=10000)
            state_input.select_option(value=payment_info["state"])

            zip_code_input = page.wait_for_selector('input[name="zipcode"]', timeout=10000)
            zip_code_input.fill(payment_info["zip_code"])

            country_input = page.wait_for_selector('select[name="country"]', timeout=10000)
            country_input.select_option(value=payment_info["country"])

            card_number_input = page.wait_for_selector('#card_number', timeout=10000)
            card_number_input.fill(payment_info["card_number"])

            cardholder_name_input = page.wait_for_selector('#name_on_card', timeout=10000)
            cardholder_name_input.fill(payment_info["cardholder_name"])

            expiry_date_input = page.wait_for_selector('#expiry_date', timeout=10000)
            expiry_date_input.fill(payment_info["expiry_date"])

            cvv_input = page.wait_for_selector('#cvv', timeout=10000)
            cvv_input.fill(payment_info["cvc"])

            checkbox_acknowledge = page.wait_for_selector('#checkme', timeout=10000)
            checkbox_acknowledge.click()

            # uncomment to pay
            complete_reservation_button = page.wait_for_selector('#sub_button2', timeout=10000)
            # complete_reservation_button.click()

            # time.sleep(5)


            return True


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

    cabinsOfMackinawData = pay_cabinsOfMackinaw_api(4, '08/18/24', '08/20/24', 'Private Chalet - 3 Rooms, 2 Queen beds, Sofabed in Living Area, 2 TVs', payment_info)
    print(cabinsOfMackinawData)


if __name__ == '__main__':
    main()