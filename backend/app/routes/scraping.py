from flask import Blueprint, request, jsonify
import logging
from app.caravan_automation.scrapers.scrapeTimberRidgeTent import scrape_timberRidgeTent
from app.caravan_automation.scrapers.scrapeLeelanauPinesTent import scrape_leelanauPinesTent
from app.caravan_automation.scrapers.scrapeIndianRiverTent import scrape_indianRiverTent
from app.caravan_automation.scrapers.scrapeUncleDuckysTent import scrape_uncleDuckysTent
from app.caravan_automation.scrapers.scrapeTouristParkTent import scrape_touristParkTent
from app.caravan_automation.scrapers.scrapeFortSuperiorTent import scrape_fortSuperiorTent
import requests
import os

scraping_bp = Blueprint('scraping', __name__)

def get_price(place_name, min_travelers, max_travelers, scrape_function):
    """
    Generic function to handle scraping requests and return formatted response
    """
    try:
        # Get total travelers from adults and kids
        num_adults = int(request.args.get('num_adults', 1))
        num_kids = int(request.args.get('num_kids', 0))
        num_travelers = num_adults + num_kids
        
        # Get dates using the correct parameter names
        check_in = request.args.get('start_date')
        check_out = request.args.get('end_date')

        if not check_in or not check_out:
            return {"error": "Check-in and check-out dates are required"}, 400

        if num_travelers < min_travelers or num_travelers > max_travelers:
            return {
                "error": f"Number of travelers must be between {min_travelers} and {max_travelers} for {place_name}"
            }, 400

        # Pass both num_adults and num_kids to the scrape function
        result = scrape_function(check_in, check_out, num_adults, num_kids)
        return result

    except ValueError as e:
        logging.error(f"ValueError in {place_name} scraping: {str(e)}")
        return {"error": str(e)}, 400
    except Exception as e:
        logging.error(f"Error in {place_name} scraping: {str(e)}")
        return {"error": f"Failed to get price for {place_name}"}, 500


@scraping_bp.route('/api/scrape/timberRidgeTent')
def get_timberRidgeTent_price():
    return get_price('Timber Ridge', 1, 6, scrape_timberRidgeTent)


@scraping_bp.route('/api/scrape/leelanauPinesTent')
def get_leelanauPinesTent_price():
    return get_price('Leelanau Pines', 1, 6, scrape_leelanauPinesTent)


@scraping_bp.route('/api/scrape/indianRiverTent')
def get_indianRiverTent_price():
    return get_price('Indian River', 1, 6, scrape_indianRiverTent)


@scraping_bp.route('/api/scrape/uncleDuckysTent')
def get_uncleDuckysTent_price():
    return get_price('Uncle Duckys', 1, 6, scrape_uncleDuckysTent)


@scraping_bp.route('/api/scrape/touristParkTent')
def get_touristParkTent_price():
    return get_price('Tourist Park', 1, 6, scrape_touristParkTent)


@scraping_bp.route('/api/scrape/fortSuperiorTent')
def get_fortSuperiorTent_price():
    return get_price('Fort Superior', 1, 6, scrape_fortSuperiorTent)


@scraping_bp.route('/api/scrape/teePeeCampgroundTent')
def get_teePeeCampgroundTent_price():
    try:
        # Extract parameters from request
        num_adults = request.args.get('num_adults', default=1, type=int)
        num_kids = request.args.get('num_kids', default=0, type=int)
        start_date = request.args.get('start_date', default='', type=str)
        end_date = request.args.get('end_date', default='', type=str)

        # Lambda API endpoint for scraping
        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/scrape/teePeeCampgroundTent"

        # Payload for Lambda function
        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids
        }

        # Call the Lambda function
        response = requests.post(lambda_endpoint, json=payload)

        # Return the Lambda response directly
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({"error": "Failed to get price from Tee Pee Campground"}), response.status_code

    except Exception as e:
        logging.error(f"Error in get_teePeeCampgroundTent_price: {e}")
        return {"error": "Internal server error"}, 500
