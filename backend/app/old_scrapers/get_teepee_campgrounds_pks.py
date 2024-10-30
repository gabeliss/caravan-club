from playwright.sync_api import sync_playwright
import json
import time

def scrape_date_to_pk_mapping():
    date_to_pk = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False) 
        page = browser.new_page()
        
        page.goto("https://fareharbor.com/embeds/book/teepeecampground/items/74239/calendar/2025/10/")

        processed_count = 0
        
        while True:
            page.wait_for_selector('.table.table-dont-respond.calendar.success')
            date_blocks = page.query_selector_all('.cal-block.test-select-availability-action')
            
            if processed_count >= len(date_blocks):
                break
            
            for i in range(processed_count, len(date_blocks)):
                date_block = date_blocks[i]
                
                try:
                    date_block.click()
                    
                    page.wait_for_selector('span[ng-else="availability.headline"]')

                    date_text_full = page.query_selector('span[ng-else="availability.headline"]').inner_text()
                    
                    date_part = date_text_full.split("for Tent Camping on ")[1].strip().rstrip(".")
                    date_obj = datetime.strptime(date_part, "%A, %B %d, %Y")
                    date_text = date_obj.strftime("%m/%d/%y")
                    
                    page.wait_for_load_state('networkidle')
                    current_url = page.url
                    
                    if '/availability/' in current_url:
                        pk = current_url.split('/availability/')[1].split('/')[0]
                        if pk.isdigit():
                            date_to_pk[date_text] = pk
                    
                    back_button = page.wait_for_selector('a.btn-back')
                    back_button.click()
                    
                    page.wait_for_selector('.table.table-dont-respond.calendar.success')
                    date_blocks = page.query_selector_all('.cal-block.test-select-availability-action')
                    
                    processed_count = i + 1
                
                except Exception as e:
                    print(f"Error processing date block at index {i}: {e}")
                    page.goto("https://fareharbor.com/embeds/book/teepeecampground/items/74239/calendar/2025/09/")
                    processed_count = i
                    break 
                
        browser.close()
    
    # Save the dictionary to a JSON file
    with open("date_to_pk_mapping-oct.json", "w") as f:
        json.dump(date_to_pk, f, indent=4)
    
    print("Date-to-pk mapping saved to date_to_pk_mapping.json")