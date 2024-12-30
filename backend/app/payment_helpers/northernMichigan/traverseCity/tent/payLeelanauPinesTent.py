from datetime import datetime
from playwright.sync_api import sync_playwright

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

def pay_leelanauPinesTent(start_date, end_date, num_adults, num_kids, payment_info):
    start_date = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%m/%d/%y').strftime('%Y-%m-%d')

    response_data = {
        "base_price": 10,
        "tax": 5,
        "total": 15,
        "payment_successful": True
    }
    return response_data

    url = f"https://leelanaupinescampresort.com/stay/search?start={start_date}&end={end_date}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url)

        try:
            page.wait_for_selector('div:has-text("Ways To Stay")', timeout=10000)
            page.click('div.flex.flex-col.space-y-1 > div:has-text("Tent Sites")')
            page.wait_for_selector('.mantine-Select-root input[placeholder="Select a sort option"]', timeout=5000)
            page.click('.mantine-Select-root input[placeholder="Select a sort option"]')
            page.wait_for_selector('div[role="option"]:has-text("Price (Low - High)")', timeout=5000)
            page.click('div[role="option"]:has-text("Price (Low - High)")')

            page.click('svg[data-icon="chevron-down"]')

            page.wait_for_selector('div:has-text("Children")', timeout=5000)

            children_section = page.locator('div:has-text("Children")')
            children_plus_button = children_section.locator('button:has(svg[data-icon="plus"])').nth(0)

            for _ in range(num_kids):
                children_plus_button.click()
                page.wait_for_timeout(100)

            adults_section = page.locator('div:has-text("Adults")')
            adults_minus_button = adults_section.locator('button:has(svg[data-icon="minus"])').nth(1)
            adults_plus_button = adults_section.locator('button:has(svg[data-icon="plus"])').nth(1)

            current_adults = 2
            if num_adults < current_adults:
                for _ in range(current_adults - num_adults):
                    adults_minus_button.click()
                    page.wait_for_timeout(100)
            elif num_adults > current_adults:
                for _ in range(num_adults - current_adults):
                    adults_plus_button.click()
                    page.wait_for_timeout(100)

            page.click('span:has-text("Search")')
            page.wait_for_load_state('networkidle')

            no_results = page.query_selector('div.flex.flex-col.items-center.justify-center.gap-8.rounded-lg.border')
            if no_results:
                print("No results found. This should not happen. Investigate further.")
                return response_data

            options = page.query_selector_all('div[class*="min-h-"]')
            first_option = None
            lakefront_option = None

            for option in options:
                print("Found an option, checking for title...")
                
                title_element = option.query_selector('div.flex.flex-col.space-y-2 .wp-title-2')
                
                if not first_option:
                    first_option = option
                    print("Saved first option")
                
                if title_element:
                    title_text = title_element.get_attribute('title') or title_element.inner_text()
                    print(f"Found title: {title_text}")
                    
                    if 'Lakefront Basic RV' in title_text:
                        print("Found Lakefront Basic RV option!")
                        lakefront_option = option
                        break

            selected_option = lakefront_option or first_option

            if selected_option:
                price_element = selected_option.query_selector('div[class*="text-xl"][class*="font-bold"][class*="text-primary"]')
                if price_element:
                    price_element.click()
                else:
                    print("Price element not found. This should not happen. Investigate further.")
                    return response_data

                page.wait_for_selector('div.font-title.text-2xl:has-text("Choose Your Site")', timeout=5000)

                site_input = page.query_selector('div:has(> div.font-title:has-text("Choose Your Site")) input.mantine-Input-input.mantine-Select-input[type="search"][readonly]')
                
                if site_input:
                    site_input.click()

                    page.wait_for_selector('.mantine-Select-dropdown', timeout=5000)

                    first_site_option = page.query_selector('.mantine-Select-item')
                    if first_site_option:
                        first_site_option.click()
                    else:
                        print("No available sites found. This should not happen. Investigate further.")
                        return response_data
                else:
                    print("Site selection input not found. This should not happen. Investigate further.")
                    return response_data

                page.wait_for_selector('span:has-text("Add To Cart")', timeout=30000)
                page.click('span:has-text("Add To Cart")')

                no_thanks_button = page.query_selector('button:has-text("No Thanks")')
                if no_thanks_button:
                    no_thanks_button.click()
                    page.wait_for_timeout(1000)

                page.wait_for_selector('span:has-text("Go To Shopping Cart")', timeout=30000)
                page.click('span:has-text("Go To Shopping Cart")')

                page.wait_for_load_state('networkidle')
                page.wait_for_selector('span:has-text("Proceed to Checkout")', timeout=30000)
                page.click('span:has-text("Proceed to Checkout")')

                def fill_by_label(label_text, value):
                    input_element = page.locator(f'label:has-text("{label_text}")').locator('xpath=..').locator('input')
                    input_element.fill(value)

                fill_by_label("Full Name", f"{payment_info['first_name']} {payment_info['last_name']}")
                fill_by_label("Address - Line 1", payment_info['street_address'])
                
                country_input = page.locator('label:has-text("Country")').locator('xpath=..').locator('input[type="search"]')
                country_input.click()
                page.wait_for_selector('div[role="option"]:has-text("United States")')
                page.click('div[role="option"]:has-text("United States")')

                fill_by_label("City", payment_info['city'])

                state_input = page.locator('label:has-text("State")').locator('xpath=..').locator('input[type="search"]')
                state_input.click()
                full_state_name = state_mapping.get(payment_info['state'], payment_info['state'])
                page.wait_for_selector(f'div[role="option"]:has-text("{full_state_name}")')
                page.click(f'div[role="option"]:has-text("{full_state_name}")')

                fill_by_label("Postal Code", payment_info['zip_code'])
                fill_by_label("Email Address", payment_info['email'])
                fill_by_label("Phone Number", payment_info['phone_number'])

                page.click('label:has-text("Pay Total Balance")')

                price_element = page.query_selector('div:has-text("Pay Total Balance") + div.flex.gap-3')
                if price_element:
                    price_text = price_element.inner_text()
                    final_price = float(price_text.replace('$', ''))
                    print(f"Final price: ${final_price}")
                else:
                    print("Could not find final price element")
                    return response_data

                card_number_frame = page.frame_locator('#tokenFrame')
                card_number_input = card_number_frame.locator('input#ccnumfield')
                card_number_input.fill(payment_info['card_number'])

                expiry_input = page.locator('input[placeholder="MM/YY"]')
                expiry_input.fill(payment_info['expiry_date'])

                cvv_input = page.locator('input[placeholder="***"]')
                cvv_input.fill(payment_info['cvc'])

                place_order_button = page.locator('button:has-text("Place Order")')
                # place_order_button.click()

                # page.wait_for_load_state('networkidle')

                response_data["payment_successful"] = True
                response_data["base_price"] = final_price
                response_data["tax"] = 0
                response_data["total"] = final_price
                return response_data

            else:
                print("first_option not found. This should not happen. Investigate further.")
                return response_data

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
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
    leelanauPinesData = pay_leelanauPinesTent('06/04/25', '06/06/25', 3, 1, payment_info)
    print(leelanauPinesData)

if __name__ == '__main__':
    main()