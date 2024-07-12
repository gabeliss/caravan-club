from datetime import datetime
from playwright.sync_api import sync_playwright
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import traceback


def pay_timberRidge_api(num_travelers, start_date, end_date, place_name, payment_info):

    months_dict = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
        "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
    }   

    url = "https://bookingsus.newbook.cloud/timberridgeresort/api.php"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)
        time.sleep(1)

        try:
            page.wait_for_selector('#newbook_content')
            date_picker_button = page.wait_for_selector('.newbook_responsive_button', timeout=10000)

            date_picker_button.click()

            start_month = start_date[0:2]
            end_month = end_date[0:2]
            start_day = start_date[3:5].lstrip('0')
            end_day = end_date[3:5].lstrip('0')

            left_month_container = page.locator('.newbook-daterange-left')
            left_month_text = left_month_container.locator('.newbook-month').text_content().split(' ')[0]
            selected_start_month = None
            selected_end_month = None
            for i in range(12):
                if i == 0 and months_dict[start_month] == left_month_text:
                    selected_start_month = left_month_container
                    if start_month != end_month:
                        selected_end_month = page.locator('.newbook-daterange-right')
                    break

                right_month_container = page.locator('.newbook-daterange-right')
                right_month_text = right_month_container.locator('.newbook-month').text_content().split(' ')[0]
                if months_dict[start_month] == right_month_text:
                    if start_month != end_month:
                        next_month_button = right_month_container.locator('.newbook-next')
                        next_month_button.click()
                        selected_start_month = page.locator('.newbook-daterange-left')
                    else:
                        selected_start_month = right_month_container
                    break
                else:
                    next_month_button = right_month_container.locator('.newbook-next')
                    next_month_button.click()

            index = 0 if int(start_day) < 25 else -1
            selected_start_day = selected_start_month.locator(f"//table/tbody//td[normalize-space(text()) = '{start_day}']").nth(index)
            selected_start_day.click()

            index = 0 if int(end_day) < 25 else -1
            selected_end_month = page.locator('.newbook-daterange-right')
            selected_end_day = selected_end_month.locator(f"//table/tbody//td[normalize-space(text()) = '{end_day}']").nth(index)
            selected_end_day.click()
            page.wait_for_timeout(3000)

            page_container = page.locator('#category-list')
            place_containers = page_container.locator('.newbook_online_category_details')
            count = place_containers.count()
            for i in range(count):
                name_wrapper = place_containers.nth(i).locator('.newbook_online_category_name_wrapper')
                a_tag = name_wrapper.locator(f'a:has-text("{place_name}")')

                if a_tag.count() > 0:
                    buttons_div = place_containers.nth(i).locator('.newbook_online_category_row_action_buttons')
                    buttons_div.wait_for(state='visible', timeout=5000)
                    book_button = buttons_div.locator('.newbook_online_categories_tariff_type_book_button')
                    book_button.wait_for(state='visible', timeout=5000)
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
                    newbook_row.wait_for(state='visible', timeout=5000)

                    checkbox = newbook_row.locator('input[name="custom_fields[5]"]').nth(1)
                    checkbox.wait_for(state='visible', timeout=5000)
                    checkbox.click()

                    newbook_row = main_container.locator('.newbook-row').nth(2)
                    newbook_row.wait_for(state='visible', timeout=5000)

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

                    newbook_row = main_container.locator('.newbook-row').nth(6)
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

            print("Place name was not found. This should not happen. Investigate further.")
            return False


        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()


def pay_anchorInn_api(num_travelers, start_date, end_date, place_name, payment_info):

    def convert_date(date_str):
        return datetime.strptime(date_str, '%m/%d/%y').strftime('%m/%d/%Y')

    # Convert the dates
    start_date = convert_date(start_date)
    end_date = convert_date(end_date)

    url = 'https://secure.thinkreservations.com/anchorinn/reservations/availability'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
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


def pay_traverseCityKoa_api(num_travelers, start_date, end_date, place_name, payment_info):
    months_dict = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
        "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
    }

    url = "https://koa.com/campgrounds/traverse-city/reserve/"

    options = uc.ChromeOptions()
    options.headless = False
    ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
    options.add_argument(f'--user-agent={ua}')
    driver = uc.Chrome(options=options)

    driver.get(url)
    time.sleep(1)

    try:
        select_site_category = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_SiteCategory'))))
        select_site_category.select_by_value('A')

        check_in_date_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_CheckInDate')))
        check_in_date_input.click()

        start_month = start_date[0:2]
        start_day = start_date[3:5]
        start_year = '20' + start_date[6:10]

        select_month = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-month'))))
        select_month.select_by_visible_text(months_dict[start_month])

        select_year = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-year'))))
        select_year.select_by_visible_text(start_year)

        day_selector = f'a.ui-state-default[data-date="{int(start_day)}"]'
        select_day = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, day_selector)))
        select_day.click()

        check_out_date_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_CheckOutDate')))
        check_out_date_input.click()

        end_month = end_date[0:2]
        end_day = end_date[3:5]
        end_year = '20' + end_date[6:10]

        select_month = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-month'))))
        select_month.select_by_visible_text(months_dict[end_month])

        select_year = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'ui-datepicker-year'))))
        select_year.select_by_visible_text(end_year)

        day_selector = f'a.ui-state-default[data-date="{int(end_day)}"]'
        select_day = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, day_selector)))
        select_day.click()

        adults_input = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_Adults')))
        driver.execute_script("arguments[0].value = '';", adults_input)  # Clear the input field using JavaScript
        adults_input.send_keys(str(num_travelers))

        pets_group = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'Reservation_Pets_Group')))
        second_label = pets_group.find_elements(By.TAG_NAME, 'label')[1]
        second_label.click()

        equipment_type = Select(WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'Reservation_EquipmentType'))))
        equipment_type.select_by_value('A')

        next_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'nextButton')))
        next_button.click()

        time.sleep(1)

        rows = driver.find_elements(By.CSS_SELECTOR, 'div.row.reserve-sitetype-main-row')
        results = []
        cheapest_price = float('inf')
        cheapest_name = None

        for row in rows:
            title = row.find_element(By.CSS_SELECTOR, 'h4.reserve-sitetype-title').text.strip()
            try:
                price_span_element = row.find_element(By.CSS_SELECTOR, 'div.reserve-quote-per-night')
                price = price_span_element.find_element(By.CSS_SELECTOR, 'span').text.strip().lstrip('$')
                price = float(price)
                if price < cheapest_price:
                    cheapest_price = price
                    cheapest_name = title
            except:
                price = 'Unavailable'

            results.append((title, price))

        if cheapest_price == float('inf'):
            return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}
        else:
            return {"available": True, "name": cheapest_name, "price": cheapest_price, "message": "Available: $" + str(cheapest_price) + " per night"}

    except Exception as e:
        print(f"An error occurred: {e}")
        print("Traceback:")
        print(traceback.format_exc())
        driver.save_screenshot('error_screenshot.png')
        return False

    finally:
        driver.quit()


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
        "expiry_date": "01/30",
        "cvc": "1234"
    }
    # timberRidgeData = pay_timberRidge_api(4, '08/20/24', '08/23/24', 'Cottage (Sleeps 5)', payment_info)
    # print(timberRidgeData)
    # anchorInnData = pay_anchorInn_api(4, '08/21/24', '08/23/24', '1 Bedroom with Kitchenette', payment_info)
    # print(anchorInnData)
    traverseCityKoaData = pay_traverseCityKoa_api(4, '08/20/24', '08/23/24', 'Camping Cabin (No Bathroom)', payment_info)
    print(traverseCityKoaData)


if __name__ == '__main__':
    main()