import requests
from datetime import datetime
import json
import uuid


def scrape_midnr_reservations(start_date, end_date, num_adults, num_kids, park_params=None, debug=False):
    """
    Scrape the Michigan DNR Reservations website for availability at a specific park.
    
    This function uses the availability map API to determine if there are campsites
    available for the given date range at the specified park.
    
    Args:
        start_date: Start date in format MM/DD/YY
        end_date: End date in format MM/DD/YY
        num_adults: Number of adults
        num_kids: Number of children
        park_params: Dictionary containing park-specific parameters:
            - resourceLocationId: The ID of the park location
            - mapId: The ID of the map to check
            - key_map_ids: List of map IDs to check for availability (value 0 indicates availability)
        debug: Whether to print detailed debug information
        
    Returns:
        dict: Availability and pricing information with format:
        {
            "available": True/False,
            "price": float or None,
            "message": str
        }
    """
    # Default park parameters for Straits State Park if none provided
    if park_params is None:
        park_params = {
            "resourceLocationId": "-2147483350",  # Straits State Park location ID
            "mapId": "-2147483075",               # Straits State Park map ID
            "key_map_ids": ["-2147483074", "-2147483073", "-2147483072"],  # Map IDs to check for availability
            "price": 35.0                         # Default price for Straits State Park
        }
    
    try:
        if debug:
            print(f"Checking availability for dates: {start_date} to {end_date} at park with location ID: {park_params['resourceLocationId']}")
        
        # Convert date format from MM/DD/YY to YYYY-MM-DD
        start_date_obj = datetime.strptime(start_date, '%m/%d/%y')
        end_date_obj = datetime.strptime(end_date, '%m/%d/%y')
        start_date_formatted = start_date_obj.strftime('%Y-%m-%d')
        end_date_formatted = end_date_obj.strftime('%Y-%m-%d')
        
        # Calculate number of nights
        nights = (end_date_obj - start_date_obj).days
        
        # Create a session to maintain cookies
        session = requests.Session()
        
        # Set common headers that will be used for all requests
        common_headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "App-Language": "en-US",
            "App-Version": "5.94.152",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Expires": "0",
            "Sec-Ch-Ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": "\"macOS\""
        }
        
        # Generate unique IDs for the request
        cart_uid = str(uuid.uuid4())
        cart_transaction_uid = str(uuid.uuid4())
        booking_uid = str(uuid.uuid4())
        
        # Step 1: Visit the main page to get cookies
        main_url = "https://midnrreservations.com"
        try:
            main_response = session.get(main_url, headers=common_headers, timeout=30)
            if main_response.status_code != 200:
                return {"available": False, "price": None, "message": f"Failed to access main page: {main_response.status_code}"}
        except requests.exceptions.RequestException as e:
            return {"available": False, "price": None, "message": f"Failed to access main page: {str(e)}"}
        
        # Step 2: Visit the create-booking page to get additional cookies
        booking_url = "https://midnrreservations.com/create-booking"
        try:
            booking_response = session.get(booking_url, headers=common_headers, timeout=30)
            if booking_response.status_code != 200:
                return {"available": False, "price": None, "message": f"Failed to access booking page: {booking_response.status_code}"}
        except requests.exceptions.RequestException as e:
            return {"available": False, "price": None, "message": f"Failed to access booking page: {str(e)}"}
        
        # Build referer URL for the availability request
        referer_params = {
            "resourceLocationId": park_params["resourceLocationId"],
            "mapId": park_params["mapId"],
            "searchTabGroupId": "0",
            "bookingCategoryId": "0",
            "startDate": start_date_formatted,
            "endDate": end_date_formatted,
            "nights": str(nights),
            "isReserving": "true",
            "equipmentId": "-32768",
            "subEquipmentId": "-32768",
            "peopleCapacityCategoryCounts": "[[-32768,null,1,null]]",
            "filterData": "{}",
            "searchTime": datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3],
            "flexibleSearch": "[false,false,null,1]"
        }
        
        # Encode the referer parameters
        encoded_referer_params = "&".join([f"{k}={requests.utils.quote(str(v))}" for k, v in referer_params.items()])
        referer_url = f"https://midnrreservations.com/create-booking/results?{encoded_referer_params}"
        common_headers["Referer"] = referer_url
        
        # Generate request ID and traceparent headers
        request_id = f"{uuid.uuid4().hex[:32]}"
        common_headers["Request-Id"] = f"|{request_id}.{uuid.uuid4().hex[:16]}"
        common_headers["traceparent"] = f"00-{request_id}-{uuid.uuid4().hex[:16]}-01"
        
        # Current timestamp in ISO format for the seed parameter
        current_time_iso = datetime.now().isoformat(timespec='milliseconds') + 'Z'
        
        # Build map availability API URL
        map_availability_params = {
            "mapId": park_params["mapId"],
            "bookingCategoryId": "0",
            "equipmentCategoryId": "-32768",
            "subEquipmentCategoryId": "-32768",
            "cartUid": cart_uid,
            "cartTransactionUid": cart_transaction_uid,
            "bookingUid": booking_uid,
            "groupHoldUid": "null",
            "startDate": start_date_formatted,
            "endDate": end_date_formatted,
            "getDailyAvailability": "false",
            "isReserving": "true",
            "filterData": "%5B%5D",  # URL encoded []
            "boatLength": "null",
            "boatDraft": "null",
            "boatWidth": "null",
            "partySize": str(num_adults + num_kids),  # Use the actual party size
            "numEquipment": "null",
            "seed": current_time_iso
        }
        
        # Encode the map availability parameters
        encoded_map_params = "&".join([f"{k}={v}" for k, v in map_availability_params.items()])
        map_availability_url = f"https://midnrreservations.com/api/availability/map?{encoded_map_params}"
        
        if debug:
            print("Making map availability request...")
            print(f"URL: {map_availability_url}")
        
        # Make the map availability request
        try:
            map_response = session.get(map_availability_url, headers=common_headers, timeout=30)
            if map_response.status_code != 200:
                if debug:
                    print(f"Failed to get map availability: {map_response.status_code}")
                return {"available": False, "price": None, "message": f"Failed to check map availability: {map_response.status_code}"}
        except requests.exceptions.RequestException as e:
            return {"available": False, "price": None, "message": f"Failed to check map availability: {str(e)}"}
        
        # Parse the map availability response
        try:
            map_data = map_response.json()
            if debug:
                print(f"Map availability response: {json.dumps(map_data, indent=2)}")
            
            # Check for the specified mapIds in mapLinkAvailabilities
            is_available = False
            key_map_ids = park_params["key_map_ids"]
            
            if "mapLinkAvailabilities" in map_data:
                for map_id in key_map_ids:
                    if map_id in map_data["mapLinkAvailabilities"]:
                        availabilities = map_data["mapLinkAvailabilities"][map_id]
                        if availabilities and 0 in availabilities:
                            is_available = True
                            if debug:
                                print(f"Found availability in mapId {map_id}")
                            break
            
            if is_available:
                # Use the park-specific price if available
                price = park_params.get("price", 35.0)  # Default to 35.0 if not specified
                return {
                    "available": True,
                    "price": price,
                    "message": f"${price:.2f} per night"
                }
            else:
                return {
                    "available": False,
                    "price": None,
                    "message": "No campsites available for selected dates"
                }
            
        except json.JSONDecodeError as e:
            if debug:
                print(f"Error parsing JSON response: {e}")
            return {"available": False, "price": None, "message": "Failed to parse availability data"}
        except Exception as e:
            if debug:
                print(f"Error processing map response: {e}")
            return {"available": False, "price": None, "message": f"Error processing availability data: {str(e)}"}
        
    except Exception as e:
        if debug:
            print(f"Error in scraper: {e}")
        return {"available": False, "price": None, "message": f"Error: {str(e)}"}