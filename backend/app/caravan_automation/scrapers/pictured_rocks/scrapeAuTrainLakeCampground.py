from datetime import datetime, timedelta
import requests
import json
import sys
from typing import Dict, List, Optional, Any


def scrape_auTrainLakeCampground(start_date: str, end_date: str, num_adults: int, num_kids: int) -> Dict[str, Any]:
    """
    Scrape Au Train Lake Campground availability from recreation.gov
    
    Args:
        start_date: Start date in format MM/DD/YY
        end_date: End date in format MM/DD/YY
        num_adults: Number of adults
        num_kids: Number of children
        
    Returns:
        Dictionary with standardized availability information:
        {
            "available": True/False,
            "price": float or None,
            "message": str
        }
    """
    # Constants
    FACILITY_ID = "233172"  # Au Train Lake Campground facility ID
    
    # Common headers for all requests
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    }
    
    # Format dates for the API calls
    try:
        start_datetime = datetime.strptime(start_date, "%m/%d/%y")
        end_datetime = datetime.strptime(end_date, "%m/%d/%y")
    except ValueError:
        return {"available": False, "price": None, "message": "Invalid date format. Use MM/DD/YY"}
    
    # Check date validity
    if end_datetime <= start_datetime:
        return {"available": False, "price": None, "message": "End date must be after start date"}
    
    # Calculate number of nights
    num_nights = (end_datetime - start_datetime).days
    
    # Convert dates to ISO format for API
    api_start_date = start_datetime.strftime("%Y-%m-%d")
    api_end_date = end_datetime.strftime("%Y-%m-%d")
    
    # Get all campsites from the facility
    campsites_url = f"https://www.recreation.gov/api/camps/campgrounds/{FACILITY_ID}/campsites"
    campgrounds_headers = headers.copy()
    campgrounds_headers["referer"] = f"https://www.recreation.gov/camping/campgrounds/{FACILITY_ID}"
    
    try:
        campsites_response = requests.get(campsites_url, headers=campgrounds_headers)
        campsites_data = campsites_response.json()
    except (requests.RequestException, json.JSONDecodeError) as e:
        return {"available": False, "price": None, "message": f"Error fetching campsite data: {str(e)}"}
    
    # Extract campsite IDs for non-MANAGEMENT sites
    campsite_ids = []
    for campsite in campsites_data.get("campsites", []):
        if campsite.get("campsite_type") != "MANAGEMENT":
            # Get min and max people allowed
            min_people = 1  # Default value
            max_people = 8  # Default value
            
            if "min_num_people" in campsite.get("site_details_map", {}):
                min_people = int(campsite["site_details_map"]["min_num_people"]["attribute_value"])
            
            if "max_num_people" in campsite.get("site_details_map", {}):
                max_people = int(campsite["site_details_map"]["max_num_people"]["attribute_value"])
            
            # Verify group size is within limits
            total_people = num_adults + num_kids
            if total_people >= min_people and total_people <= max_people:
                campsite_ids.append({
                    "id": campsite["campsite_id"],
                    "name": campsite["campsite_name"],
                    "type": campsite["campsite_type"],
                    "min_people": min_people,
                    "max_people": max_people
                })
    
    if not campsite_ids:
        return {"available": False, "price": None, "message": "No suitable campsites found for your group size"}
    
    # Check availability for each campsite
    available_sites = []
    for site in campsite_ids:
        availability_url = f"https://www.recreation.gov/api/camps/availability/campsite/{site['id']}/all"
        availability_headers = headers.copy()
        availability_headers["referer"] = f"https://www.recreation.gov/camping/campsites/{site['id']}"
        
        try:
            availability_response = requests.get(availability_url, headers=availability_headers)
            availability_data = availability_response.json()
        except (requests.RequestException, json.JSONDecodeError) as e:
            continue  # Skip this campsite if there's an error
        
        # Check if campsite is available for all requested dates
        availability_info = availability_data.get("availability", {})
        availabilities = availability_info.get("availabilities", {})
        
        is_available = True
        date_to_check = start_datetime
        while date_to_check < end_datetime:
            date_str = date_to_check.strftime("%Y-%m-%dT00:00:00Z")
            status = availabilities.get(date_str)
            if status != "Available":
                is_available = False
                break
            date_to_check += timedelta(days=1)
        
        if is_available:
            available_sites.append(site)
    
    # If no available sites, return unavailable
    if not available_sites:
        return {
            "available": False,
            "price": None,
            "message": f"No available campsites at Au Train Lake Campground from {start_date} to {end_date}"
        }
    
    # Get pricing information
    pricing_url = f"https://www.recreation.gov/api/camps/campgrounds/{FACILITY_ID}/rates"
    pricing_headers = headers.copy()
    # Using a campsite ID for the first available site in the referer
    pricing_headers["referer"] = f"https://www.recreation.gov/camping/campsites/{available_sites[0]['id']}"
    
    try:
        pricing_response = requests.get(pricing_url, headers=pricing_headers)
        pricing_data = pricing_response.json()
    except (requests.RequestException, json.JSONDecodeError) as e:
        # Even if we can't get pricing, we know sites are available
        return {
            "available": True,
            "price": 24,  # Default price as fallback
            "message": "$24.00 per night (estimated)"
        }
    
    # Determine the price per night
    price_per_night = None
    for rate_info in pricing_data.get("rates_list", []):
        try:
            season_start = datetime.strptime(rate_info.get("season_start", ""), "%Y-%m-%dT%H:%M:%SZ")
            season_end = datetime.strptime(rate_info.get("season_end", ""), "%Y-%m-%dT%H:%M:%SZ")
            
            if season_start <= start_datetime <= season_end:
                # Find price for standard non-electric sites
                for site_type, price in rate_info.get("price_map", {}).items():
                    if "STANDARD NONELECTRIC" in site_type:
                        price_per_night = price
                        break
        except (ValueError, TypeError):
            continue
    
    # If can't determine price, default to standard price
    if price_per_night is None:
        price_per_night = 24  # Default price based on historical data
    
    # Prepare standardized response
    result = {
        "available": True,
        "price": price_per_night,
        "message": f"${price_per_night:.2f} per night"
    }
    
    return result


def main():
    # Default values
    start_date = '06/08/25'
    end_date = '06/10/25'
    num_adults = 3
    num_kids = 1
    
    # Check for command-line arguments
    if len(sys.argv) > 1:
        start_date = sys.argv[1]
    if len(sys.argv) > 2:
        end_date = sys.argv[2]
    if len(sys.argv) > 3:
        try:
            num_adults = int(sys.argv[3])
        except ValueError:
            print("Number of adults must be an integer")
            return
    if len(sys.argv) > 4:
        try:
            num_kids = int(sys.argv[4])
        except ValueError:
            print("Number of kids must be an integer")
            return
    
    # Run the scraper with the provided parameters
    print(f"Checking availability for Au Train Lake Campground from {start_date} to {end_date} for {num_adults} adults and {num_kids} kids...")
    auTrainLakeCampgroundData = scrape_auTrainLakeCampground(start_date, end_date, num_adults, num_kids)
    print(json.dumps(auTrainLakeCampgroundData, indent=2))

if __name__ == '__main__':
    main()