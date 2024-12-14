from datetime import datetime
from app import db

# User Model
class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    street_address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    cardholder_name = db.Column(db.String(100))
    card_number = db.Column(db.String(16))
    card_type = db.Column(db.String(50))
    expiry_date = db.Column(db.String(5))  # Format: MM/YY
    cvc = db.Column(db.String(4))
    is_admin = db.Column(db.Boolean, default=False)

    # Relationships
    trips = db.relationship('Trip', back_populates='user', cascade='all, delete-orphan')

# Trip Model
class Trip(db.Model):
    __tablename__ = 'trips'

    trip_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Updated ForeignKey
    destination = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    nights = db.Column(db.Integer, nullable=False)
    num_adults = db.Column(db.Integer, nullable=False)
    num_kids = db.Column(db.Integer, nullable=False)
    caravan_fee = db.Column(db.Float, nullable=False)
    grand_total = db.Column(db.Float, nullable=False)
    trip_fully_processed = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='trips')
    segments = db.relationship('Segment', back_populates='trip', cascade='all, delete-orphan')

# Segment Model
class Segment(db.Model):
    __tablename__ = 'segments'

    segment_id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.trip_id'), nullable=False)  # Updated ForeignKey
    name = db.Column(db.String(100), nullable=False)  # e.g., "mackinacCity"
    selected_accommodation = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    nights = db.Column(db.Integer, nullable=False)  # Duration of this segment
    base_price = db.Column(db.Float, nullable=False, default=0.0)
    tax = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)
    payment_successful = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    trip = db.relationship('Trip', back_populates='segments')
