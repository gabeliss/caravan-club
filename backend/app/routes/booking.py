from flask import Blueprint, request, jsonify, render_template, send_file
from app.models import Trip, User, Segment
from app.routes.utils import get_accommodation_email_data, generate_confirmation_number
from app import db
import pytz
from datetime import datetime, timedelta
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import os
import base64
import boto3
from botocore.config import Config
import random

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/api/trip', methods=['POST'])
def create_trip():
    data = request.json

    # Validate user data
    user_data = data.get("user")
    if not user_data:
        return {"error": "User data is required"}, 400

    # Find the user by email
    user = User.query.filter_by(email=user_data["email"]).first()
    if user:
        # Update the user's current info (optional)
        user.phone_number = user_data.get("phone_number", user.phone_number)
        user.street_address = user_data.get("street_address", user.street_address)
        user.city = user_data.get("city", user.city)
        user.state = user_data.get("state", user.state)
        user.zip_code = user_data.get("zip_code", user.zip_code)
        user.country = user_data.get("country", user.country)
        user.cardholder_name = user_data.get("cardholder_name", user.cardholder_name)
        user.card_number = user_data.get("card_number", user.card_number)
        user.card_type = user_data.get("card_type", user.card_type)
        user.expiry_date = user_data.get("expiry_date", user.expiry_date)
        user.cvc = user_data.get("cvc", user.cvc)
    else:
        # Create a new user if none exists
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

    # Use provided confirmation number instead of generating one
    confirmation_number = trip_data.get("confirmation_number")
    if not confirmation_number:
        return {"error": "Confirmation number is required"}, 400

    # Create the trip, copying user info into the trip
    trip = Trip(
        confirmation_number=confirmation_number,
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
        date_booked=datetime.now(pytz.timezone('US/Eastern')).strftime('%Y-%m-%d %I:%M %p EST'),
        # Historical user information
        email=user.email,
        booking_address=f"{user.street_address}, {user.city}, {user.state}, {user.zip_code}, {user.country}",
        cardholder_name=user.cardholder_name,
        card_number=user.card_number,
        card_type=user.card_type,
        expiry_date=user.expiry_date,
        cvc=user.cvc
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

    # Send confirmation email to customer
    send_trip_confirmation_email(user_data["email"], trip)
    
    # Send notification email to admin
    send_admin_notification_email(trip)

    return {"message": "Trip created successfully", "trip_id": trip.trip_id}, 201

def get_presigned_url(object_key, end_date):
    """Generate a presigned URL for an S3 object that expires after the trip end date"""
    try:
        # Calculate expiration time in seconds from now until end_date + 1 day
        now = datetime.now(pytz.UTC)
        
        # Convert end_date to datetime if it's a date object
        if isinstance(end_date, type(datetime.now().date())):
            end_date = datetime.combine(end_date, datetime.max.time())
            
        # Convert end_date to UTC if it's not already
        if not end_date.tzinfo:
            end_date = pytz.UTC.localize(end_date)
            
        # Add one day buffer after trip end date
        expiration_date = end_date + timedelta(days=1)
        expiration = int((expiration_date - now).total_seconds())
        
        # Ensure minimum expiration is 1 hour (in case end_date has already passed)
        expiration = max(3600, expiration)
        
        s3_client = boto3.client(
            's3',
            config=Config(signature_version='s3v4'),
            region_name='us-east-2'
        )
        
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': 'caravan-bucket',
                'Key': f'nm-itineraries/{object_key}'
            },
            ExpiresIn=expiration
        )
        return url
    except Exception as e:
        logging.error(f"Error generating presigned URL: {str(e)}")
        return None

def send_trip_confirmation_email(email, trip):
    """
    Sends a confirmation email after the trip is created using SendGrid.
    """
    try:
        # Add this at the start of the function to suppress SendGrid debug logs
        logging.getLogger("python_http_client").setLevel(logging.WARNING)
        
        # Calculate night numbers for each segment
        current_night = 1
        segments_data = []
        for segment in trip.segments:
            accommodation_info = get_accommodation_email_data(segment.selected_accommodation)
            segment_data = {
                "name": segment.name,
                "selected_accommodation": accommodation_info["title"],
                "address": accommodation_info["address"],
                "start_date": segment.start_date.strftime('%b %-d'),
                "end_date": segment.end_date.strftime('%b %-d'),
                "total": f"{segment.total:.2f}",
                "nights": segment.nights,
                "night_start": current_night,
                "night_end": current_night + segment.nights - 1
            }
            segments_data.append(segment_data)
            current_night += segment.nights

        # Render the HTML template
        html_content = render_template(
            "email_trip_confirmation.html",
            first_name=trip.user.first_name,
            confirmation_number=trip.confirmation_number,
            start_date=trip.start_date.strftime('%B %d, %Y'),
            end_date=trip.end_date.strftime('%B %d, %Y'),
            num_adults=trip.num_adults,
            num_kids=trip.num_kids,
            grand_total=f"{trip.grand_total:.2f}",
            segments=segments_data,
            trip=trip
        )

        # Create the email message
        message = Mail(
            from_email='caravantripplan@gmail.com',
            to_emails=email,
            subject='Your Caravan Trip Plan is Confirmed!',
            html_content=html_content
        )

        # Send the email
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        logging.info(f"Email sent to {email}. Status code: {response.status_code}")
    except Exception as e:
        logging.error(f"Failed to send email to {email}: {str(e)}")

def send_admin_notification_email(trip):
    """
    Sends a notification email to admin when a new trip is booked.
    """
    try:
        # Suppress SendGrid debug logs
        logging.getLogger("python_http_client").setLevel(logging.WARNING)
        
        # Create segments summary
        segments_summary = []
        for segment in trip.segments:
            segment_info = (
                f"{segment.name}: {segment.selected_accommodation}\n"
                f"Dates: {segment.start_date.strftime('%b %-d')} - {segment.end_date.strftime('%b %-d')}\n"
                f"Total: ${segment.total:.2f}\n"
                f"Payment Status: {'Success' if segment.payment_successful else 'Failed'}\n\n"
            )
            segments_summary.append(segment_info)

        # Create email content
        html_content = f"""
        <h2>New Trip Booked</h2>
        <p><strong>Confirmation Number:</strong> {trip.confirmation_number}</p>
        <p><strong>Date Booked:</strong> {trip.date_booked}</p>
        
        <h3>Customer Details:</h3>
        <p>
        Name: {trip.user.first_name} {trip.user.last_name}<br>
        Email: {trip.user.email}<br>
        Phone: {trip.user.phone_number}<br>
        Address: {trip.booking_address}
        </p>

        <h3>Trip Details:</h3>
        <p>
        Destination: {trip.destination}<br>
        Dates: {trip.start_date.strftime('%B %d, %Y')} - {trip.end_date.strftime('%B %d, %Y')}<br>
        Duration: {trip.nights} nights<br>
        Guests: {trip.num_adults} adults, {trip.num_kids} children<br>
        Grand Total: ${trip.grand_total:.2f}<br>
        Fully Processed: {'Yes' if trip.trip_fully_processed else 'No'}
        </p>

        <h3>Segments:</h3>
        <pre style="margin: 0;">{''.join(segments_summary)}</pre>
        """

        # Create the email message
        message = Mail(
            from_email='caravantripplan@gmail.com',
            to_emails='caravantripplan@gmail.com',
            subject=f'New Booking: {trip.confirmation_number} - {trip.user.first_name} {trip.user.last_name}',
            html_content=html_content
        )

        # Send the email
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        logging.info(f"Admin notification email sent. Status code: {response.status_code}")
    except Exception as e:
        logging.error(f"Failed to send admin notification email: {str(e)}")

@booking_bp.route("/api/preview-email-confirmation")
def preview_email_confirmation():
    # Create sample data that matches the structure expected by the template
    preview_date = datetime.now()
    data = {
        "first_name": "John",
        "confirmation_number": "C7730407",  # This needs to match a real trip in the database
        "start_date": (preview_date).strftime('%B %d, %Y'),
        "end_date": (preview_date + timedelta(days=5)).strftime('%B %d, %Y'),
        "num_adults": 2,
        "num_kids": 1,
        "trip": {
            "nights": 5  # Added this for the attachment info
        },
        "segments": [
            {
                "name": "Timber Ridge",
                "selected_accommodation": "Timber Ridge Recreation",
                "address": "4050 E Hammond Rd, Traverse City, MI 49686",
                "start_date": "Jun 15",
                "end_date": "Jun 17",
                "total": "199.99",
                "nights": 2,
                "night_start": 1,
                "night_end": 2
            },
            {
                "name": "Leelanau Pines",
                "selected_accommodation": "Leelanau Pines Campground",
                "address": "6500 E. Leelanau Pines Drive, Cedar, MI 49621",
                "start_date": "Jun 17",
                "end_date": "Jun 19",
                "total": "249.99",
                "nights": 2,
                "night_start": 3,
                "night_end": 4
            },
            {
                "name": "Fort Superior",
                "selected_accommodation": "Fort Superior Campground",
                "address": "N7685 Old Golf Course Rd. Munising, MI 49862",
                "start_date": "Jun 19",
                "end_date": "Jun 20",
                "total": "179.99",
                "nights": 1,
                "night_start": 5,
                "night_end": 5
            }
        ],
        "grand_total": "629.97"
    }
    return render_template("email_trip_confirmation.html", **data)

@booking_bp.route('/api/generate-confirmation', methods=['GET'])
def generate_confirmation_number():
    try:
        # Get all trips to check existing confirmation numbers
        trips = Trip.query.with_entities(Trip.confirmation_number).all()
        existing_numbers = set(trip[0] for trip in trips)
        
        # Keep generating until we find a unique number
        while True:
            digits = str(random.randint(1000000, 9999999))
            candidate_number = f"C{digits}"
            if candidate_number not in existing_numbers:
                return jsonify({"confirmation_number": candidate_number})
    except Exception as e:
        logging.error(f"Error generating confirmation number: {str(e)}")
        # Generate a random number as fallback
        digits = str(random.randint(1000000, 9999999))
        return jsonify({"confirmation_number": f"C{digits}"})

@booking_bp.route('/api/itinerary/<confirmation_number>', methods=['GET'])
def get_itinerary(confirmation_number):
    try:
        # Find the trip
        trip = Trip.query.filter_by(confirmation_number=confirmation_number).first()
        if not trip:
            return {"error": "Trip not found"}, 404

        # Determine which PDF to serve based on number of nights
        pdf_key = None
        if trip.nights <= 2:
            pdf_key = "1-2-day-northern-michigan.pdf"
        elif trip.nights <= 4:
            pdf_key = "3-4-day-northern-michigan.pdf"
        elif trip.nights <= 6:
            pdf_key = "5-6-day-northern-michigan.pdf"
        else:
            return {"error": "No itinerary available"}, 404

        # Get the S3 object
        s3_client = boto3.client('s3')
        try:
            response = s3_client.get_object(
                Bucket='caravan-bucket',
                Key=f'nm-itineraries/{pdf_key}'
            )
            return send_file(
                response['Body'],
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'caravan-itinerary.pdf'
            )
        except Exception as e:
            logging.error(f"Error fetching PDF from S3: {str(e)}")
            return {"error": "Failed to fetch itinerary"}, 500

    except Exception as e:
        logging.error(f"Error serving itinerary: {str(e)}")
        return {"error": "Internal server error"}, 500
