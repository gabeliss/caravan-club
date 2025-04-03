from flask import Blueprint, request, jsonify
import logging
from backend.app.caravan_automation.scrapers.traverse_city.scrapeTimberRidge import scrape_timberRidgeTent
from backend.app.caravan_automation.scrapers.traverse_city.scrapeLeelanauPines import scrape_leelanauPinesTent
from backend.app.caravan_automation.scrapers.mackinac_city.scrapeIndianRiver import scrape_indianRiverTent
from backend.app.caravan_automation.scrapers.pictured_rocks.scrapeUncleDuckysAuTrain import scrape_uncleDuckysTent
from backend.app.caravan_automation.scrapers.pictured_rocks.scrapeTouristPark import scrape_touristParkTent
from backend.app.caravan_automation.scrapers.pictured_rocks.scrapeFortSuperior import scrape_fortSuperiorTent
import requests
import os
import httpx
import asyncio

scraping_bp = Blueprint('scraping', __name__)

def get_price(place_name, min_travelers, max_travelers, scrape_function):
    """
    Generic function to handle scraping requests
    """
    try:
        num_adults = int(request.args.get('num_adults', 1))
        num_kids = int(request.args.get('num_kids', 0))
        num_travelers = num_adults + num_kids

        check_in = request.args.get('start_date')
        check_out = request.args.get('end_date')

        if not check_in or not check_out:
            return jsonify({"error": "Check-in and check-out dates are required"}), 400

        if num_travelers < min_travelers or num_travelers > max_travelers:
            return jsonify({
                "error": f"Number of travelers must be between {min_travelers} and {max_travelers} for {place_name}"
            }), 400

        # Call the scraping function directly
        result = scrape_function(check_in, check_out, num_adults, num_kids)
        return jsonify(result), 200

    except ValueError as e:
        logging.error(f"ValueError in {place_name} scraping: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logging.error(f"Error in {place_name} scraping: {str(e)}")
        return jsonify({"error": f"Failed to get price for {place_name}"}), 500

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

# For Lambda calls, use synchronous requests
def call_lambda(lambda_endpoint, payload):
    response = requests.post(lambda_endpoint, json=payload, timeout=120)
    return response.json()

@scraping_bp.route('/api/scrape/teePeeCampgroundTent')
def get_teePeeCampgroundTent_price():
    try:
        num_adults = request.args.get('num_adults', default=1, type=int)
        num_kids = request.args.get('num_kids', default=0, type=int)
        start_date = request.args.get('start_date', default='', type=str)
        end_date = request.args.get('end_date', default='', type=str)

        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/scrape/teePeeCampgroundTent"

        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids
        }

        result = call_lambda(lambda_endpoint, payload)
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error in get_teePeeCampgroundTent_price: {e}")
        return jsonify({"error": "Internal server error"}), 500

@scraping_bp.route('/api/scrape/whiteWaterParkTent')
def get_whiteWaterParkTent_price():
    try:
        num_adults = request.args.get('num_adults', default=1, type=int)
        num_kids = request.args.get('num_kids', default=0, type=int)
        start_date = request.args.get('start_date', default='', type=str)
        end_date = request.args.get('end_date', default='', type=str)

        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/scrape/whiteWaterParkTent"

        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids
        }

        result = call_lambda(lambda_endpoint, payload)
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error in get_whiteWaterParkTent_price: {e}")
        return jsonify({"error": "Internal server error"}), 500