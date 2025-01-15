from app.scrape_helpers.northernMichigan.traverseCity.tent.scrapeTimberRidgeTent import scrape_timberRidgeTent
from app.scrape_helpers.northernMichigan.traverseCity.tent.scrapeLeelanauPinesTent import scrape_leelanauPinesTent
from app.scrape_helpers.northernMichigan.mackinacCity.tent.scrapeIndianRiverTent import scrape_indianRiverTent
from app.scrape_helpers.northernMichigan.mackinacCity.tent.scrapeTeePeeCampgroundTent import scrape_teePeeCampgroundTent
from app.scrape_helpers.northernMichigan.picturedRocks.tent.scrapeUncleDuckysTent import scrape_uncleDuckysTent
from app.scrape_helpers.northernMichigan.picturedRocks.tent.scrapeTouristParkTent import scrape_touristParkTent
from app.scrape_helpers.northernMichigan.picturedRocks.tent.scrapeFortSuperiorTent import scrape_fortSuperiorTent
from app.payment_helpers.northernMichigan.traverseCity.tent.payTimberRidgeTent import pay_timberRidgeTent
from app.payment_helpers.northernMichigan.traverseCity.tent.payLeelanauPinesTent import pay_leelanauPinesTent
from app.payment_helpers.northernMichigan.mackinacCity.tent.payIndianRiverTent import pay_indianRiverTent
from app.payment_helpers.northernMichigan.mackinacCity.tent.payTeePeeCampgroundTent import pay_teePeeCampgroundTent
from app.payment_helpers.northernMichigan.picturedRocks.tent.payUncleDuckysTent import pay_uncleDuckysTent
from app.payment_helpers.northernMichigan.picturedRocks.tent.payTouristParkTent import pay_touristParkTent
from app.payment_helpers.northernMichigan.picturedRocks.tent.payFortSuperiorTent import pay_fortSuperiorTent
import os, base64
import jwt as pyjwt
import logging
import requests
import pytz
from datetime import datetime, timedelta
from flask import request, jsonify
from functools import wraps
from app import app, db
from app.models import User, Trip, Segment
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "secure_password")

@app.route('/api/hello')
def index():
    return 'Hello, World - modified! Psyche, modified again!'

@app.route('/api/caravan-admin/login', methods=['POST'])
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


@app.route('/api/trip/<int:trip_id>', methods=['GET'])
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


@app.route('/api/trip', methods=['POST'])
def create_trip():
    data = request.json

    # Validate user data
    user_data = data.get("user")
    if not user_data:
        return {"error": "User data is required"}, 400

    # Find or create the user
    user = User.query.filter_by(
        first_name=user_data["first_name"],
        last_name=user_data["last_name"], 
        email=user_data["email"],
        phone_number=user_data.get("phone_number"),
        street_address=user_data.get("street_address"),
        city=user_data.get("city"),
        state=user_data.get("state"),
        zip_code=user_data.get("zip_code"),
        country=user_data.get("country"),
        cardholder_name=user_data.get("cardholder_name"),
        card_number=user_data.get("card_number"),
        card_type=user_data.get("card_type"),
        expiry_date=user_data.get("expiry_date"),
        cvc=user_data.get("cvc")
    ).first()
    if not user:
        user = User(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            phone_number=user_data.get("phone_number"),
            street_address=user_data.get("street_address"),
            city=user_data.get("city"),
            state=user_data.get("state"),
            zip_code=user_data.get("zip_code"),
            country=user_data.get("country"),
            cardholder_name=user_data.get("cardholder_name"),
            card_number=user_data.get("card_number"),
            card_type=user_data.get("card_type"),
            expiry_date=user_data.get("expiry_date"),
            cvc=user_data.get("cvc"),
        )
        db.session.add(user)

    # Validate trip data
    trip_data = data.get("trip")
    if not trip_data:
        return {"error": "Trip data is required"}, 400

    # Create the trip
    trip = Trip(
        user=user,
        destination=trip_data["destination"],
        start_date=trip_data["start_date"],
        end_date=trip_data["end_date"],
        nights=trip_data["nights"],
        num_adults=trip_data["num_adults"],
        num_kids=trip_data["num_kids"],
        caravan_fee=trip_data["caravan_fee"],
        grand_total=trip_data["grand_total"],
        trip_fully_processed=trip_data["trip_fully_processed"],
        date_booked=datetime.now(pytz.timezone('US/Eastern')).strftime('%Y-%m-%d %I:%M %p EST')
    )

    # Add segments to the trip
    segments_data = trip_data.get("segments", [])
    for segment_data in segments_data:
        segment = Segment(
            trip=trip,
            name=segment_data["name"],
            selected_accommodation=segment_data["selected_accommodation"],
            start_date=segment_data["start_date"],
            end_date=segment_data["end_date"],
            nights=segment_data["nights"],
            base_price=segment_data["base_price"],
            tax=segment_data["tax"],
            total=segment_data["total"],
            payment_successful=segment_data["payment_successful"]
        )
        db.session.add(segment)

    # Commit the transaction
    db.session.commit()

    # Send confirmation email
    send_trip_confirmation_email(user_data["email"], trip)

    return {"message": "Trip created successfully", "trip_id": trip.trip_id}, 201


def send_trip_confirmation_email(email, trip):
    """
    Sends a confirmation email after the trip is created using SendGrid.
    """
    try:
        trip_details = """
            Hello {first_name},

            Thank you for booking your trip with us! Here are your trip details:

            - Destination: {destination}
            - Start Date: {start_date}
            - End Date: {end_date}
            - Number of Nights: {nights}
            - Number of Adults: {num_adults}
            - Number of Kids: {num_kids}
            - Total Cost: ${grand_total:.2f}

            Segments:
            {segments}

            Please contact us if you have any questions.

            Best regards,
            Caravan Club
            """.format(
                first_name=trip.user.first_name,
                destination=trip.destination,
                start_date=trip.start_date.strftime('%B %d, %Y'),
                end_date=trip.end_date.strftime('%B %d, %Y'),
                nights=trip.nights,
                num_adults=trip.num_adults,
                num_kids=trip.num_kids,
                grand_total=trip.grand_total,
                segments="".join(
                    "  - {name}: {start} to {end}, ${total:.2f}\n".format(
                        name=segment.name,
                        start=segment.start_date.strftime('%B %d'),
                        end=segment.end_date.strftime('%B %d'),
                        total=segment.total
                    ) for segment in trip.segments
                )
            )

        message = Mail(
            from_email='caravantripplan@gmail.com',
            to_emails=email,
            subject='Your Caravan Trip Confirmation',
            plain_text_content=trip_details
        )
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        logging.info(f"Email sent to {email}. Status code: {response.status_code}, Body: {response.body}, Headers: {response.headers}")
    except Exception as e:
        logging.error(f"Failed to send email to {email}: {str(e)}")


@app.route('/api/trips', methods=['GET'])
@admin_required
def get_all_trips():
    trips = Trip.query.all()
    return {
        "trips": [
            {
                "trip_id": trip.trip_id,
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


@app.route('/api/trips/search', methods=['GET'])
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



@app.route('/api/trip/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    # Fetch the trip by ID
    trip = Trip.query.get(trip_id)
    if not trip:
        return {"error": "Trip not found"}, 404

    # Delete the trip and its associated segments
    db.session.delete(trip)
    db.session.commit()

    return {"message": f"Trip with ID {trip_id} has been successfully deleted."}, 200



@app.route('/api/images')
def serve_images():
    image_paths = get_image_paths()
    images = [read_image(path) for path in image_paths]
    return images

def get_image_paths():
    gallery_path = 'app/static/images/landing-gallery' 
    image_paths = []

    try:
        for filename in os.listdir(gallery_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                image_paths.append(os.path.join(gallery_path, filename))
    except FileNotFoundError:
        print(f"Directory not found: {gallery_path}")

    return image_paths

def read_image(path):
    with open(path, 'rb') as image_file:
        encoded_image = base64.b64encode(image_file.read())
        encoded_image_str = encoded_image.decode('utf-8')
        return encoded_image_str
    

def get_price(place_name, min_travelers, max_travelers, scrape_function):
    try:
        num_adults = request.args.get('num_adults', default=1, type=int)
        num_kids = request.args.get('num_kids', default=0, type=int)
        num_travelers = num_adults + num_kids
        if num_adults < min_travelers:
            return {"available": False, "price": None, "message": f"Not available for less than {min_travelers} travelers"}
        
        if num_travelers > max_travelers:
            return {"available": False, "price": None, "message": f"Not available for more than {max_travelers} travelers"}

        start_date = request.args.get('start_date', default='', type=str)
        end_date = request.args.get('end_date', default='', type=str)
        data = scrape_function(start_date, end_date, num_adults, num_kids)
        return data
    except Exception as e:
        logging.error(f"Error in {place_name}: %s", str(e), exc_info=True)
        return {"error": "Internal server error"}, 500
    

def process_payment(api_function):
    num_adults = request.args.get('num_adults', default=1, type=int)
    num_kids = request.args.get('num_kids', default=0, type=int)
    start_date = request.args.get('start_date', default='', type=str)
    end_date = request.args.get('end_date', default='', type=str)
    
    payment_info = {
        "first_name": request.args.get('payment_info[first_name]', default='', type=str),
        "last_name": request.args.get('payment_info[last_name]', default='', type=str),
        "email": request.args.get('payment_info[email]', default='', type=str),
        "phone_number": request.args.get('payment_info[phone_number]', default='', type=str),
        "street_address": request.args.get('payment_info[street_address]', default='', type=str),
        "city": request.args.get('payment_info[city]', default='', type=str),
        "state": request.args.get('payment_info[state]', default='', type=str),
        "zip_code": request.args.get('payment_info[zip_code]', default='', type=str),
        "country": request.args.get('payment_info[country]', default='', type=str),
        "cardholder_name": request.args.get('payment_info[cardholder_name]', default='', type=str),
        "card_number": request.args.get('payment_info[card_number]', default='', type=str),
        "card_type": request.args.get('payment_info[card_type]', default='', type=str),
        "expiry_date": request.args.get('payment_info[expiry_date]', default='', type=str),
        "cvc": request.args.get('payment_info[cvc]', default='', type=str)
    }
    
    result = api_function(start_date, end_date, num_adults, num_kids, payment_info)
    return jsonify(result)


#### SCRAPES - Northern Michigan - Tent ####

@app.route('/api/scrape/timberRidgeTent')
def get_timberRidgeTent_price():
    return get_price('Timber Ridge', 1, 6, scrape_timberRidgeTent)

@app.route('/api/scrape/leelanauPinesTent')
def get_leelanauPinesTent_price():
    return get_price('Leelanau Pines', 1, 8, scrape_leelanauPinesTent)

@app.route('/api/scrape/indianRiverTent')
def get_indianRiverTent_price():
    return get_price('Indian River', 1, 8, scrape_indianRiverTent)

@app.route('/api/scrape/uncleDuckysTent')
def get_uncleDuckysTent_price():
    return get_price('Uncle Duckys', 1, 5, scrape_uncleDuckysTent)

@app.route('/api/scrape/touristParkTent')
def get_touristParkTent_price():
    return get_price('Tourist Park', 1, 6, scrape_touristParkTent)

@app.route('/api/scrape/fortSuperiorTent')
def get_fortSuperiorTent_price():
    return get_price('Fort Superior', 1, 6, scrape_fortSuperiorTent)

#### PAYMENTS - Northern Michigan - Tent ####

@app.route('/api/pay/timberRidgeTent')
def process_timberRidgeTent_payment():
    return process_payment(pay_timberRidgeTent)

@app.route('/api/pay/fortSuperiorTent')
def process_fortSuperiorTent_payment():
    return process_payment(pay_fortSuperiorTent)


#### AWS Lambda SCRAPES - Northern Michigan - Teepee ####
@app.route('/api/scrape/teePeeCampgroundTent')
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
    


@app.route('/api/pay/uncleDuckysTent', methods=['POST'])
def pay_uncleDuckysTent():
    try:
        # Extract parameters from request body
        payload = request.json
        num_adults = payload.get('num_adults', 1)
        num_kids = payload.get('num_kids', 0)
        start_date = payload.get('start_date', '')
        end_date = payload.get('end_date', '')
        payment_info = payload.get('payment_info', {})

        # Lambda API endpoint
        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/pay/uncleDuckysTent"

        # Payload for Lambda function
        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids,
            "paymentInfo": payment_info
        }

        # Make the request to Lambda
        response = requests.post(lambda_endpoint, json=payload)
        return jsonify(response.json()), response.status_code

    except Exception as e:
        logging.error(f"Error in pay_uncleDuckysTent: {e}")
        return {"error": "Internal server error"}, 500
    

@app.route('/api/pay/leelanauPinesTent', methods=['POST'])
def pay_leelanauPinesTent():
    try:
        # Extract parameters from request body
        payload = request.json
        num_adults = payload.get('num_adults', 1)
        num_kids = payload.get('num_kids', 0)
        start_date = payload.get('start_date', '')
        end_date = payload.get('end_date', '')
        payment_info = payload.get('payment_info', {})

        # Lambda API endpoint
        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/pay/leelanauPinesTent"

        # Payload for Lambda function
        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids,
            "paymentInfo": payment_info
        }

        # Make the request to Lambda
        response = requests.post(lambda_endpoint, json=payload)
        return jsonify(response.json()), response.status_code

    except Exception as e:
        logging.error(f"Error in pay_leelanauPinesTent: {e}")
        return {"error": "Internal server error"}, 500


@app.route('/api/pay/indianRiverTent', methods=['POST'])
def pay_indianRiverTent():
    try:
        # Extract parameters from request body
        payload = request.json
        num_adults = payload.get('num_adults', 1)
        num_kids = payload.get('num_kids', 0)
        start_date = payload.get('start_date', '')
        end_date = payload.get('end_date', '')
        payment_info = payload.get('payment_info', {})

        # Lambda API endpoint
        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/pay/indianRiverTent"

        # Payload for Lambda function
        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids,
            "paymentInfo": payment_info
        }

        # Make the request to Lambda
        response = requests.post(lambda_endpoint, json=payload)
        return jsonify(response.json()), response.status_code

    except Exception as e:
        logging.error(f"Error in pay_indianRiverTent: {e}")
        return {"error": "Internal server error"}, 500
    

@app.route('/api/pay/touristParkTent')
def process_touristParkTent_payment():
    try:
        # Extract parameters from request body
        payload = request.json
        num_adults = payload.get('num_adults', 1)
        num_kids = payload.get('num_kids', 0)
        start_date = payload.get('start_date', '')
        end_date = payload.get('end_date', '')
        payment_info = payload.get('payment_info', {})

        # Lambda API endpoint
        lambda_endpoint = "https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/pay/touristParkTent"

        # Payload for Lambda function
        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "numAdults": num_adults,
            "numKids": num_kids,
            "paymentInfo": payment_info
        }

        # Make the request to Lambda
        response = requests.post(lambda_endpoint, json=payload)
        return jsonify(response.json()), response.status_code

    except Exception as e:
        logging.error(f"Error in process_touristParkTent_payment: {e}")
        return {"error": "Internal server error"}, 500