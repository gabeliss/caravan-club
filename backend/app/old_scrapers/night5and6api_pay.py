from playwright.sync_api import sync_playwright
import time
from datetime import datetime


def pay_uncleducky_api(num_travelers, start_date, end_date, place_name, payment_info):
    url = 'https://paddlersvillage.checkfront.com/reserve/?inline=1&category_id=3%2C2%2C4%2C9&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.paddlingmichigan.com&1704390232826'

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
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
            time.sleep(1)
            # Click on the yurt tab
            yurt_button = page.wait_for_selector('#cf-tab2', timeout=10000)
            yurt_button.click()

            time.sleep(1)

            # Check if no availability message is present
            unavailable = page.query_selector("//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]")
            if unavailable:
                print('Unavailable, returning False')
                return False

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


        except Exception as e:
            print(f"An error occurred: {e}")
            with open("error_log.txt", "a") as log_file:
                log_file.write(f"Error: {str(e)}\n")
            price = None
            return False

        finally:
            browser.close()

    print("This should never happen, investigate further")
    return False


def pay_fortSuperior_api(num_travelers, start_date, end_date, place_name, payment_info):
    start_timestamp = int(datetime.strptime(start_date, '%m/%d/%y').timestamp() * 1000)
    end_timestamp = int(datetime.strptime(end_date, '%m/%d/%y').timestamp() * 1000)

    url = f"https://www.fortsuperiorcampground.com/campsites/rooms/%3FcheckIn%3D{start_timestamp}%26checkOut%3D{end_timestamp}%26adults%3D{num_travelers}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            page.goto(url, wait_until="domcontentloaded")

            iframe_element = page.wait_for_selector("iframe[title='Book a Room']", timeout=10000)
            if not iframe_element:
                raise Exception("Could not find iframe with title 'Book a Room'")

            iframe = iframe_element.content_frame()
            if not iframe:
                raise Exception("Could not get content frame from iframe")

            li_elements = iframe.wait_for_selector("li.room", state="attached", timeout=30000)
            if not li_elements:
                raise Exception("Could not find any li.room elements")

            li_elements = iframe.query_selector_all("li.room")

            for li in li_elements:
                site_name_element = li.query_selector("h3 a span.strans")
                if not site_name_element:
                    continue
                site_name = site_name_element.inner_text()
                if site_name == place_name:
                    book_now_button = li.query_selector("button.fancy-btn.s-button.button")
                    book_now_button.click()
                    time.sleep(1)

                    details_form = page.wait_for_selector("form[name='detailsForm']", timeout=10000)

                    first_name_input = details_form.query_selector("input#firstName")
                    first_name_input.fill(payment_info['first_name'])

                    last_name_input = details_form.query_selector("input#lastName")
                    last_name_input.fill(payment_info['last_name'])

                    email_input = details_form.query_selector("input#email")
                    email_input.fill(payment_info['email'])

                    phone_input = details_form.query_selector("input#phone")
                    phone_input.fill(payment_info['phone_number'])

                    country_select = details_form.query_selector("select#country")
                    country_select.select_option(value='string:us')

                    continue_button = details_form.query_selector("button.pay-now")
                    continue_button.click()
                    time.sleep(1)

                    form_details = page.wait_for_selector("div#form-details", timeout=10000)

                    # Switch to the iframe with title='Credit / Debit Card'
                    iframe = page.wait_for_selector("iframe[title='Credit / Debit Card']", timeout=10000)
                    iframe_content = iframe.content_frame()

                    # Fill out the card details within the iframe
                    iframe_content.fill("input#cardNumber", payment_info['card_number'])
                    iframe_content.fill("input#cardExpiration", payment_info['expiry_date'])
                    iframe_content.fill("input#cardCvv", payment_info['cvc'])
                    iframe_content.fill("input#cardHolderName", payment_info['cardholder_name'])

                    # Continue with submitting the payment if necessary
                    complete_checkout_button = form_details.query_selector("button[data-hook='cashier-payments-method-pay-button']")
                    # complete_checkout_button.click() #uncomment to pay
                    return True

            
            return False

        except Exception as e:
            print(f"An error occurred: {e}")
            return False

        finally:
            browser.close()


def pay_touristPark_api(num_travelers, start_date, end_date, place_name, payment_info):
    start_date_formatted = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date_formatted = datetime.strptime(end_date, '%m/%d/%y').strftime('%Y-%m-%d')
    
    url = f"https://www.campspot.com/book/munisingtouristparkcampground/search/{start_date_formatted}/{end_date_formatted}/guests0,{num_travelers},0/list"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        context.set_extra_http_headers({
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
        })
        page = context.new_page()

        try:
            page.goto(url)
            time.sleep(2)
            page.wait_for_selector('div.search-results', timeout=10000)

            no_availability_div = page.query_selector('div.search-results-none')
            if no_availability_div:
                print('This should never happen. Investigate')
                return False
        
            tent_site_general = page.query_selector(f'a.search-results-site-link[aria-label="{place_name}"]')
            tent_site_general.click()

            page.wait_for_selector("section.site-content")

            site_info = page.query_selector("div.site-info")

            first_select_button = site_info.query_selector("table.site-locations-table > tr.site-locations-table-site .site-locations-table-site-select-button")
            first_select_button.click()

            site_booking = page.query_selector("div.site-booking")
            add_to_cart_button = site_booking.query_selector("div.mobile-modal-add-to-cart")
            add_to_cart_button.click()
            time.sleep(1)

            cart_confirmation_section = page.wait_for_selector("section.cart-confirmation")
            review_cart_button = cart_confirmation_section.wait_for_selector("a.cart-confirmation-item-actions-button.app-view-cart-button", state="visible", timeout=10000)
            review_cart_button.click()

            cart_content_section = page.wait_for_selector("section.cart-content")
            proceed_to_checkout_button = cart_content_section.query_selector("a.cart-summary-checkout-button.app-cart-checkout-button")
            proceed_to_checkout_button.click()
            time.sleep(1)

            checkout_div = page.wait_for_selector("div.checkout")

            guest_full_name_input = checkout_div.wait_for_selector("input#guest-full-name-input", timeout=10000)
            guest_full_name_input.fill(payment_info['first_name'] + ' ' + payment_info['last_name'])

            guest_address_input = checkout_div.query_selector("input#guest-address-line-1")
            guest_address_input.fill(payment_info['street_address'])

            guest_postal_code_input = checkout_div.query_selector("input#guest-postal-code-input")
            guest_postal_code_input.fill(payment_info['zip_code'])
            guest_email_input = checkout_div.query_selector("input#guest-email-input")
            guest_email_input.fill(payment_info['email'])

            guest_phone_input = checkout_div.query_selector("input#guest-phone-number-input")
            guest_phone_input.fill(payment_info['phone_number'])

            continue_to_payment_button = checkout_div.wait_for_selector("button.checkout-form-submit-button.app-checkout-continue-to-payment-amount-button", state="visible", timeout=10000)
            continue_to_payment_button.scroll_into_view_if_needed()
            page.wait_for_timeout(500)  # Adding a small delay to ensure it registers
            continue_to_payment_button.click()

            continue_to_payment_method_button = checkout_div.wait_for_selector("button.checkout-form-submit-button.app-checkout-continue-to-payment-info-button", state="visible", timeout=10000)
            continue_to_payment_method_button.scroll_into_view_if_needed()
            page.wait_for_timeout(500)  # Adding a small delay to ensure it registers
            continue_to_payment_method_button.click()

            iframe_token = page.wait_for_selector("iframe#tokenFrame", timeout=10000)
            ccnum_frame = iframe_token.content_frame()
            ccnum_frame.fill("input#ccnumfield", payment_info['card_number'])

            page.fill("input#month", payment_info['expiry_date'].split('/')[0])
            page.fill("input#year", payment_info['expiry_date'].split('/')[1][-2:])

            page.fill("input#payment-security-code-input", payment_info['cvc'])

            terms_conditions_checkbox = checkout_div.query_selector("input#terms-and-conditions-accept")
            terms_conditions_checkbox.click()

            place_order_button = checkout_div.query_selector("button.checkout-form-submit-button.mod-place-order.app-checkout-submit")
            #place_order_button.click()
            return True
        
        except Exception as e:
            screenshot_path = 'error_screenshot.png'
            page.screenshot(path=screenshot_path)
            print(f"An error occurred: {e}")
            print(f"Screenshot saved to {screenshot_path}")
            return False

        finally:
            browser.close()

def main():
    payment_info = {
        "first_name": "Lebron",
        "last_name": "James",
        "email": "lebronjames@gmail.com",
        "phone_number": "(313) 432-1234",
        "street_address": "1234 Rocky Rd",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "45441",
        "country": "USA",
        "cardholder_name": "Kobe Bryant",
        "card_number": "123412345612345",
        "expiry_date": "01/30",
        "cvc": "1234"
    }
    # uncleDuckyData = pay_uncleducky_api(4, '09/01/24', '09/03/24', '#31 Yurt: Moose (Paddlers Village)', payment_info)
    # print(uncleDuckyData)
    # fortSuperiorData = pay_fortSuperior_api(2, '08/24/24', '08/26/24', 'Campsite 4', payment_info)
    # print(fortSuperiorData)
    touristParkData = pay_touristPark_api(2, '09/15/24', '09/17/24', 'Waterfront Rustic Tent Site', payment_info)
    print(touristParkData)


if __name__ == '__main__':
    main()