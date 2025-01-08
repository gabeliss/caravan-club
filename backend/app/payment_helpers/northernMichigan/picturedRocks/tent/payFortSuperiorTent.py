from datetime import datetime
from playwright.sync_api import sync_playwright
import time


def pay_fortSuperiorTent(start_date, end_date, num_adults, num_kids, payment_info):
    start_timestamp = int(datetime.strptime(start_date, '%m/%d/%y').timestamp() * 1000)
    end_timestamp = int(datetime.strptime(end_date, '%m/%d/%y').timestamp() * 1000)

    response_data = {
        "base_price": 0,
        "tax": 0,
        "total": 0,
        "payment_successful": False
    }

    url = f"https://www.fortsuperiorcampground.com/campsites/rooms/%3FcheckIn%3D{start_timestamp}%26checkOut%3D{end_timestamp}%26adults%3D{num_adults}"

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

            try:
                li_elements = iframe.wait_for_selector("li.room", state="attached", timeout=5000)
            except Exception as e:
                print("li_elements not found")
                return response_data

            li_elements = iframe.query_selector_all("li.room")

            for li in li_elements:
                site_name_element = li.query_selector("h3 a span.strans")

                if not site_name_element:
                    continue
                site_name = site_name_element.inner_text()
                if "Canvas Tent Barrack" not in site_name:
                    price_element = li.query_selector("div.price span.value")

                    if not price_element:
                        continue
                    price_text = price_element.inner_text()
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

                    payment_div = page.wait_for_selector("div.payment", timeout=10000)
                    if payment_div:
                        # Get base price from first row of breakdown table
                        base_price_element = payment_div.query_selector("table.breakdown-table tr:first-child td:last-child")
                        if base_price_element:
                            base_price_text = base_price_element.inner_text().strip()
                            response_data["base_price"] = float(base_price_text.replace("$", ""))

                        # Get processing fee from second row
                        fee_element = payment_div.query_selector("table.breakdown-table tr:nth-child(2) td:last-child")
                        if fee_element:
                            fee_text = fee_element.inner_text().strip()
                            response_data["tax"] = float(fee_text.replace("$", ""))

                        # Get total from final row
                        total_element = payment_div.query_selector("tfoot tr td.total-value")
                        if total_element:
                            total_text = total_element.inner_text().strip()
                            response_data["total"] = float(total_text.replace("$", ""))

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
                    response_data['payment_successful'] = True
                    return response_data

            
            return response_data

        except Exception as e:
            print(f"An error occurred: {e}")
            return response_data

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
    fortSuperiorData = pay_fortSuperiorTent('06/08/25', '06/10/25', 2, 1, payment_info)
    print(fortSuperiorData)

if __name__ == '__main__':
    main()