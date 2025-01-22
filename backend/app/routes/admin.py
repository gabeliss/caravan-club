from flask import Blueprint, request, jsonify
from functools import wraps
import jwt as pyjwt
from datetime import datetime, timedelta
import os
from app.models import Trip, User
from app import db

admin_bp = Blueprint('admin', __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "secure_password")

@admin_bp.route('/api/hello')
def index():
    return 'Hello, World - modified! Psyche, modified again!'

@admin_bp.route('/api/caravan-admin/login', methods=['POST'])
def admin_login():
    data = request.json
    print("data", data)
    print("ADMIN_PASSWORD", ADMIN_PASSWORD)
    if data.get("password") == ADMIN_PASSWORD:
        token = pyjwt.encode({
            "admin": True,
            "exp": datetime.utcnow() + timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token}), 200
    return jsonify({"error": "Invalid password"}), 401


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Authorization required"}), 403
        try:
            decoded = pyjwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
            if not decoded.get("admin"):
                raise pyjwt.InvalidTokenError
        except pyjwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except pyjwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/api/trip/<int:trip_id>', methods=['GET'])
@admin_required
def get_trip_details(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return {"error": "Trip not found"}, 404

    user = trip.user

    return {
        "user": {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "street_address": user.street_address,
            "city": user.city,
            "state": user.state,
            "zip_code": user.zip_code,
            "country": user.country,
            "cardholder_name": user.cardholder_name,
            "card_number": user.card_number,
            "card_type": user.card_type,
            "expiry_date": user.expiry_date,
            "cvc": user.cvc
        },
        "trip": {
            "trip_id": trip.trip_id,
            "confirmation_number": trip.confirmation_number,
            "user_id": trip.user_id,
            "destination": trip.destination,
            "start_date": trip.start_date.strftime('%m/%d/%y'),
            "end_date": trip.end_date.strftime('%m/%d/%y'),
            "date_booked": trip.date_booked.strftime('%m/%d/%y %H:%M:%S'),
            "nights": trip.nights,
            "num_adults": trip.num_adults,
            "num_kids": trip.num_kids,
            "caravan_fee": trip.caravan_fee,
            "grand_total": trip.grand_total,
            "trip_fully_processed": trip.trip_fully_processed,
            "segments": [
                {
                    "segment_id": segment.segment_id,
                    "trip_id": segment.trip_id,
                    "name": segment.name,
                    "selected_accommodation": segment.selected_accommodation,
                    "start_date": segment.start_date.strftime('%m/%d/%y'),
                    "end_date": segment.end_date.strftime('%m/%d/%y'),
                    "nights": segment.nights,
                    "base_price": segment.base_price,
                    "tax": segment.tax,
                    "total": segment.total,
                    "payment_successful": segment.payment_successful
                }
                for segment in trip.segments
            ]
        }
    }, 200


@admin_bp.route('/api/trips', methods=['GET'])
@admin_required
def get_all_trips():
    trips = Trip.query.all()
    return {
        "trips": [
            {
                "trip_id": trip.trip_id,
                "confirmation_number": trip.confirmation_number,
                "user": {
                    "first_name": trip.user.first_name,
                    "last_name": trip.user.last_name,
                    "email": trip.user.email
                },
                "destination": trip.destination,
                "start_date": trip.start_date.strftime('%m/%d/%y'),
                "end_date": trip.end_date.strftime('%m/%d/%y'),
                "date_booked": trip.date_booked.strftime('%m/%d/%y %H:%M:%S'),
                "grand_total": trip.grand_total,
                "trip_fully_processed": trip.trip_fully_processed
            }
            for trip in trips
        ]
    }, 200


@admin_bp.route('/api/trips/search', methods=['GET'])
@admin_required
def search_trips_by_email():
    email = request.args.get("email")
    if not email:
        return {"error": "Email is required"}, 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return {"error": "User not found"}, 404

    trips = Trip.query.filter_by(user_id=user.user_id).all()
    return {
        "trips": [
            {
                "trip_id": trip.trip_id,
                "confirmation_number": trip.confirmation_number,
                "user": {
                    "first_name": trip.user.first_name,
                    "last_name": trip.user.last_name,
                    "email": trip.user.email
                },
                "destination": trip.destination,
                "start_date": trip.start_date.strftime('%m/%d/%y'),
                "end_date": trip.end_date.strftime('%m/%d/%y'),
                "date_booked": trip.date_booked.strftime('%m/%d/%y %H:%M:%S'),
                "grand_total": trip.grand_total,
                "trip_fully_processed": trip.trip_fully_processed
            }
            for trip in trips
        ]
    }, 200


@admin_bp.route('/api/trip/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    # Fetch the trip by ID
    trip = Trip.query.get(trip_id)
    if not trip:
        return {"error": "Trip not found"}, 404

    # Delete the trip and its associated segments
    db.session.delete(trip)
    db.session.commit()

    return {"message": f"Trip with ID {trip_id} has been successfully deleted."}, 200


# Add new route to get trip by confirmation number
@admin_bp.route('/api/trip/confirmation/<confirmation_number>', methods=['GET'])
@admin_required
def get_trip_by_confirmation(confirmation_number):
    trip = Trip.query.filter_by(confirmation_number=confirmation_number).first()
    if not trip:
        return {"error": "Trip not found"}, 404

    user = trip.user
    return {
        "user": {
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "street_address": user.street_address,
            "city": user.city,
            "state": user.state,
            "zip_code": user.zip_code,
            "country": user.country,
            "cardholder_name": user.cardholder_name,
            "card_number": user.card_number,
            "card_type": user.card_type,
            "expiry_date": user.expiry_date,
            "cvc": user.cvc
        },
        "trip": {
            "trip_id": trip.trip_id,
            "confirmation_number": trip.confirmation_number,
            "user_id": trip.user_id,
            "destination": trip.destination,
            "start_date": trip.start_date.strftime('%m/%d/%y'),
            "end_date": trip.end_date.strftime('%m/%d/%y'),
            "date_booked": trip.date_booked.strftime('%m/%d/%y %H:%M:%S'),
            "nights": trip.nights,
            "num_adults": trip.num_adults,
            "num_kids": trip.num_kids,
            "caravan_fee": trip.caravan_fee,
            "grand_total": trip.grand_total,
            "trip_fully_processed": trip.trip_fully_processed,
            "segments": [
                {
                    "segment_id": segment.segment_id,
                    "trip_id": segment.trip_id,
                    "name": segment.name,
                    "selected_accommodation": segment.selected_accommodation,
                    "start_date": segment.start_date.strftime('%m/%d/%y'),
                    "end_date": segment.end_date.strftime('%m/%d/%y'),
                    "nights": segment.nights,
                    "base_price": segment.base_price,
                    "tax": segment.tax,
                    "total": segment.total,
                    "payment_successful": segment.payment_successful
                }
                for segment in trip.segments
            ]
        }
    }, 200
