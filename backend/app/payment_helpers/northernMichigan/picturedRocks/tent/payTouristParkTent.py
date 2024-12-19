from datetime import datetime
from playwright.sync_api import sync_playwright
import time

state_mapping = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
    }

def pay_touristParkTent(start_date, end_date, num_adults, num_kids, payment_info):
    # Convert dates to the required format (YYYY-MM-DD)
    start_date_formatted = datetime.strptime(start_date, "%m/%d/%y").strftime("%Y-%m-%d")
    end_date_formatted = datetime.strptime(end_date, "%m/%d/%y").strftime("%Y-%m-%d")

    response_data = {
        "base_price": 0,
        "tax": 0,
        "total": 0,
        "payment_successful": False
    }

    url = f"https://www.campspot.com/book/munisingtouristparkcampground/search/{start_date_formatted}/{end_date_formatted}/guests{num_kids},{num_adults},0/list?campsiteCategory=Tent%20Sites"

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
        page.goto(url)
        time.sleep(1)

        try:
            page.wait_for_selector('div.search-results', timeout=10000)

            no_availability_div = page.query_selector('div.search-results-none')
            if no_availability_div:
                print("No availability found, investigate further.")
                return response_data
            
            place_containers = page.query_selector_all('ul.search-results-list li')
            place_container = None
            for container in place_containers:
                if 'search-results-ad' in container.get_attribute('class'):
                    continue
                site_name = container.query_selector('.search-results-site-title').inner_text().strip()
                if site_name == 'Waterfront Rustic Tent Site':
                    place_container = container
                    break
            
            if not place_container:
                for container in place_containers:
                    if 'search-results-ad' in container.get_attribute('class'):
                        continue
                    site_name = container.query_selector('.search-results-site-title').inner_text().strip()
                    if site_name == 'Rustic Tent Site':
                        place_container = container
                        break

            if place_container:
                price_span = place_container.query_selector('span.app-average-per-night-price')
                if price_span:
                    place_container.click()

                    page.wait_for_selector("section.site-content")

                    site_info = page.query_selector("div.site-info")

                    first_select_button = site_info.query_selector("table.site-locations-table > tr.site-locations-table-site .site-locations-table-site-select-button")
                    first_select_button.click()

                    site_booking = page.query_selector("div.site-booking")
                    add_to_cart_button = site_booking.query_selector("div.mobile-modal-add-to-cart")
                    add_to_cart_button.click()

                    cart_confirmation_section = page.wait_for_selector("section.cart-confirmation")
                    review_cart_button = cart_confirmation_section.wait_for_selector("a.cart-confirmation-item-actions-button.app-view-cart-button", state="visible", timeout=10000)
                    review_cart_button.click()

                    cart_content_section = page.wait_for_selector("section.cart-content")
                    proceed_to_checkout_button = cart_content_section.query_selector("a.cart-summary-checkout-button.app-cart-checkout-button")
                    proceed_to_checkout_button.click()

                    checkout_div = page.wait_for_selector("div.checkout")

                    guest_full_name_input = checkout_div.wait_for_selector("input#guest-full-name-input", timeout=10000)
                    guest_full_name_input.fill(payment_info['first_name'] + ' ' + payment_info['last_name'])

                    guest_address_input = checkout_div.query_selector("input#guest-address-line-1")
                    guest_address_input.fill(payment_info['street_address'])

                    guest_postal_code_input = checkout_div.query_selector("input#guest-postal-code-input")
                    guest_postal_code_input.fill(payment_info['zip_code'])

                    guest_city_input = checkout_div.query_selector("input#guest-city-input")
                    guest_city_input.fill(payment_info['city'])

                    guest_state_select = checkout_div.query_selector("select#guest-state-select")
                    full_state_name = state_mapping.get(payment_info['state'], payment_info['state'])
                    guest_state_select.select_option(full_state_name)

                    guest_email_input = checkout_div.query_selector("input#guest-email-input")
                    guest_email_input.fill(payment_info['email'])

                    guest_phone_input = checkout_div.query_selector("input#guest-phone-number-input")
                    guest_phone_input.fill(payment_info['phone_number'])

                    continue_to_payment_button = checkout_div.wait_for_selector("button.checkout-form-submit-button.app-checkout-continue-to-payment-amount-button", state="visible", timeout=10000)
                    continue_to_payment_button.scroll_into_view_if_needed()
                    continue_to_payment_button.click()

                    continue_to_payment_method_button = checkout_div.wait_for_selector("button.checkout-form-submit-button.app-checkout-continue-to-payment-info-button", state="visible", timeout=10000)
                    continue_to_payment_method_button.scroll_into_view_if_needed()
                    continue_to_payment_method_button.click()

                    iframe_token = page.wait_for_selector("iframe#tokenFrame", timeout=10000)
                    ccnum_frame = iframe_token.content_frame()
                    ccnum_frame.fill("input#ccnumfield", payment_info['card_number'])

                    page.fill("input#month", payment_info['expiry_date'].split('/')[0])
                    page.fill("input#year", payment_info['expiry_date'].split('/')[1][-2:])

                    page.fill("input#payment-security-code-input", payment_info['cvc'])

                    terms_conditions_checkbox = checkout_div.query_selector("input#terms-and-conditions-accept")
                    terms_conditions_checkbox.click()

                    # Get the total price
                    total_price_element = checkout_div.query_selector(".checkout-summary-order-total")
                    if total_price_element:
                        price_text = total_price_element.inner_text().strip()
                        # Convert "$72.00" to 72.00
                        response_data["base_price"] = float(price_text.replace("$", ""))
                        response_data["total"] = response_data["base_price"]
                        response_data["tax"] = 0
                    else:
                        print("No total price found, investigating further")
                        return response_data
                    
                    place_order_button = checkout_div.query_selector("button.checkout-form-submit-button.mod-place-order.app-checkout-submit")
                    #place_order_button.click()

                    response_data["payment_successful"] = True
                    return response_data  # Changed to return response_data instead of True
                else:
                    print("No price found, investigating further")
                    return response_data
            else:
                print("No place container found, investigating further")
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
    touristParkData = pay_touristParkTent('06/08/25', '06/10/25', 3, 1, payment_info)
    print(touristParkData)

if __name__ == '__main__':
    main()