from flask import Blueprint, request, jsonify, render_template
from app.models import Trip, User, Segment
from app.routes.utils import get_accommodation_title, generate_confirmation_number
from app import db
import pytz
from datetime import datetime, timedelta
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import os
import base64

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

    # Generate unique confirmation number
    confirmation_number = generate_confirmation_number()

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

    # Send confirmation email
    send_trip_confirmation_email(user_data["email"], trip)

    return {"message": "Trip created successfully", "trip_id": trip.trip_id}, 201


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
            accommodation_info = get_accommodation_title(segment.selected_accommodation)
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
            trip=trip  # Add trip to the template context
        )

        # Create the email message
        message = Mail(
            from_email='caravantripplan@gmail.com',
            to_emails=email,
            subject='Your Caravan Trip Plan is Confirmed!',
            html_content=html_content
        )

        # Path to the PDF file based on the number of nights
        pdf_path = f"./itineraries/{trip.nights}-day-northern-michigan.pdf"

        # Attach the PDF
        try:
            with open(pdf_path, 'rb') as f:
                pdf_data = f.read()
                encoded_pdf = base64.b64encode(pdf_data).decode()
                attachment = Attachment(
                    FileContent(encoded_pdf),
                    FileName(f"{trip.nights}-day-northern-michigan.pdf"),
                    FileType('application/pdf'),
                    Disposition('attachment')
                )
                message.add_attachment(attachment)
        except FileNotFoundError:
            logging.error(f"PDF file not found: {pdf_path}")

        # Send the email
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        logging.info(f"Email sent to {email}. Status code: {response.status_code}, Body: {response.body}, Headers: {response.headers}")
    except Exception as e:
        logging.error(f"Failed to send email to {email}: {str(e)}")


@booking_bp.route("/api/preview-email-confirmation")
def preview_email_confirmation():
    # Create sample data that matches the structure expected by the template
    preview_date = datetime.now()
    data = {
        "first_name": "John",
        "confirmation_number": "C12345678",
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
