import httpx
from flask import Blueprint, request, jsonify
import logging
import requests
import os

payment_bp = Blueprint('payment', __name__)

def process_payment_lambda(place_name, lambda_path):
    """
    Generic function to process payments through AWS Lambda synchronously
    """
    try:
        payload = request.json.get('params', {})  # Extract the params object

        # Use camelCase keys to extract values
        num_adults = payload.get('num_adults', 1)
        num_kids = payload.get('num_kids', 0)
        start_date = payload.get('start_date', '')
        end_date = payload.get('end_date', '')
        payment_info = payload.get('payment_info', {})
        execute_payment = payload.get('execute_payment', False)

        email = payment_info.get('email', '')
        if email != 'gabeliss17@gmail.com':
            execute_payment = True

        # Lambda API endpoint
        lambda_endpoint = f"https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/pay/{lambda_path}"
        print("lambda_endpoint", lambda_endpoint)

        # Payload for Lambda function
        lambda_payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids,
            "paymentInfo": payment_info,
            "executePayment": execute_payment
        }

        response = requests.post(lambda_endpoint, json=lambda_payload, timeout=120)
        return jsonify(response.json()), response.status_code

    except requests.Timeout:
        logging.error(f"Timeout error in process_payment for {place_name}")
        return jsonify({"error": "Request timed out"}), 504

    except Exception as e:
        logging.error(f"Error in process_payment for {place_name}: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Convert each route to synchronous Flask route
@payment_bp.route('/api/pay/uncleDuckysTent', methods=['POST'])
def pay_uncleDuckysTent():
    return process_payment_lambda("Uncle Duckys", "uncleDuckysTent")

@payment_bp.route('/api/pay/leelanauPinesTent', methods=['POST'])
def pay_leelanauPinesTent():
    return process_payment_lambda("Leelanau Pines", "leelanauPinesTent")

@payment_bp.route('/api/pay/indianRiverTent', methods=['POST'])
def pay_indianRiverTent():
    return process_payment_lambda("Indian River", "indianRiverTent")

@payment_bp.route('/api/pay/touristParkTent', methods=['POST'])
def pay_touristParkTent():
    return process_payment_lambda("Tourist Park", "touristParkTent")

@payment_bp.route('/api/pay/fortSuperiorTent', methods=['POST'])
def pay_fortSuperiorTent():
    return process_payment_lambda("Fort Superior", "fortSuperiorTent")

@payment_bp.route('/api/pay/timberRidgeTent', methods=['POST'])
def pay_timberRidgeTent():
    return process_payment_lambda("Timber Ridge", "timberRidgeTent")

@payment_bp.route('/api/pay/teePeeCampgroundTent', methods=['POST'])
def pay_teePeeCampgroundTent():
    return process_payment_lambda("Tee Pee Campground", "teePeeCampgroundTent")

@payment_bp.route('/api/pay/whiteWaterParkTent', methods=['POST'])
def pay_whiteWaterParkTent():
    return process_payment_lambda("White Water Park", "whiteWaterParkTent")

