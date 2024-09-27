from datetime import datetime
from playwright.sync_api import sync_playwright


def scrape_leelanauPinesTent(start_date, end_date, num_adults, num_kids):
    start_date = datetime.strptime(start_date, '%m/%d/%y').strftime('%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%m/%d/%y').strftime('%Y-%m-%d')

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
            children_plus_button = children_section.locator('button:has(svg[data-icon="plus"])').nth(0)  # Use nth(0) to select the correct button

            for _ in range(num_kids):
                children_plus_button.click()
                page.wait_for_timeout(100)

            adults_section = page.locator('div:has-text("Adults")')
            adults_minus_button = adults_section.locator('button:has(svg[data-icon="minus"])').nth(1)  # Use nth(0) to select the correct button
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
                return {"available": False, "name": None, "price": None, "message": "Not available for selected dates."}

            first_option = page.query_selector('div[class*="min-h-"]')
            if first_option:
                name = first_option.query_selector('div[class*="wp-title-2"]').inner_text()
                price_element = first_option.query_selector('div[class*="text-xl"][class*="font-bold"][class*="text-primary"]')
                price = round(float(price_element.inner_text().replace('$', '').strip()), 2)
                return {
                    "available": True,
                    "name": name,
                    "price": price,
                    "message": f"${price:.2f} per night"
                }
            else:
                return {"available": False, "name": None, "price": None, "message": "No options found."}

        except Exception as e:
            print(f"An error occurred: {e}")
            return False
        finally:
            browser.close()


def main():
    leelanauPinesData = scrape_leelanauPinesTent('10/15/24', '10/17/24', 5, 1)
    print(leelanauPinesData)

if __name__ == '__main__':
    main()