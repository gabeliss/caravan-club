from datetime import datetime
import requests
from bs4 import BeautifulSoup
import sys
import os

# Fix imports to work when run as a script
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from backend.app.caravan_automation.scrapers.scrapeMidnrReservations import scrape_midnr_reservations


def scrape_traverseCityStatePark(start_date, end_date, num_adults, num_kids):
    """
    Scrape the Michigan DNR Reservations website for Traverse City State Park availability.
    
    Args:
        start_date: Start date in format MM/DD/YY
        end_date: End date in format MM/DD/YY
        num_adults: Number of adults
        num_kids: Number of children
        
    Returns:
        dict: Availability and pricing information with format:
        {
            "available": True/False,
            "price": float or None,
            "message": str
        }
    """
    # Define Traverse City State Park specific parameters
    traverseCity_params = {
        "resourceLocationId": "-2147483344",  # Traverse City State Park location ID
        "mapId": "-2147483043",               # Traverse City State Park map ID
        "key_map_ids": ["-2147483042", "-2147483041", "-2147483040"],  # Map IDs to check for availability
        "price": 35.0                         # Default price for Traverse City State Park
    }
    
    # Use the generalized function with Traverse City State Park parameters
    return scrape_midnr_reservations(start_date, end_date, num_adults, num_kids, park_params=traverseCity_params)



def main():
    # Test the Traverse City State Park scraper with a date range that should be available
    traverseCityStateParkData = scrape_traverseCityStatePark('06/08/25', '06/10/25', 2, 0)
    print("Result for dates 06/08/25 to 06/10/25:", traverseCityStateParkData)
    
    # Test with a date range that should not be available
    unavailableData = scrape_traverseCityStatePark('07/22/25', '07/24/25', 2, 0)
    print("Result for dates 07/22/25 to 07/24/25:", unavailableData)


if __name__ == '__main__':
    main()