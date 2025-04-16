from datetime import datetime
import requests
from bs4 import BeautifulSoup
import sys
import os

# Fix imports to work when run as a script
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from scrapeMidnrReservations import scrape_midnr_reservations


def scrape_straitsStatePark(start_date, end_date, num_adults, num_kids):
    """
    Scrape the Michigan DNR Reservations website for Straits State Park availability.
    
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
    # Define Straits State Park specific parameters
    straits_params = {
        "resourceLocationId": "-2147483350",  # Straits State Park location ID
        "mapId": "-2147483075",               # Straits State Park map ID
        "key_map_ids": ["-2147483074", "-2147483073", "-2147483072"],  # Map IDs to check for availability
        "price": 35.0                         # Default price for Straits State Park
    }
    
    # Use the generalized function with Straits State Park parameters
    return scrape_midnr_reservations(start_date, end_date, num_adults, num_kids, park_params=straits_params)



def main():
    # Test the Straits State Park scraper with a date range that should be available
    straitsStateParkData = scrape_straitsStatePark('06/08/25', '06/10/25', 2, 0)
    print("Result for dates 06/08/25 to 06/10/25:", straitsStateParkData)
    
    # Test with a date range that should not be available
    unavailableData = scrape_straitsStatePark('06/26/25', '06/28/25', 2, 0)
    print("Result for dates 06/26/25 to 06/28/25:", unavailableData)


if __name__ == '__main__':
    main()