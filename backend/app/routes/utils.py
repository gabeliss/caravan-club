import os
import json
import logging
from datetime import datetime
import random
import string
from app.models import Trip

# Load the JSON data when the module starts
with open(os.path.join(os.path.dirname(__file__), '..', 'northernmichigandata.json')) as f:
    northern_michigan_data = json.load(f)

def get_accommodation_email_data(accommodation_id):
    """Helper function to get accommodation title and address from the JSON data"""
    # Convert "Tee Pee Campground" -> "teePeeCampground"
    key = accommodation_id.replace(' ', '')  # Remove spaces
    key = key[0].lower() + key[1:]  # Make first letter lowercase
    
    # Map accommodation IDs to their locations in the JSON
    accommodation_map = {
        "timberRidge": ("traverseCity", "timberRidge"),
        "leelanauPines": ("traverseCity", "leelanauPines"),
        "whiteWaterPark": ("traverseCity", "whiteWaterPark"),
        "indianRiver": ("mackinacCity", "indianRiver"),
        "teePeeCampground": ("mackinacCity", "teePeeCampground"),
        "uncleDucky": ("picturedRocks", "uncleDucky"),
        "touristPark": ("picturedRocks", "touristPark"),
        "fortSuperior": ("picturedRocks", "fortSuperior")
    }
    
    try:
        if key in accommodation_map:
            region, site = accommodation_map[key]
            return {
                "title": northern_michigan_data[region]["tent"][site]["title"],
                "address": northern_michigan_data[region]["tent"][site]["address"]
            }
    except KeyError:
        pass
    
    return {"title": accommodation_id, "address": ""}  # Return original ID if not found

def generate_confirmation_number():
    """Generate a unique confirmation number starting with 'C' followed by 8 digits"""
    while True:
        # Generate 8 random digits
        digits = ''.join(random.choices(string.digits, k=8))
        confirmation_number = f"C{digits}"
        
        # Check if this confirmation number already exists
        if not Trip.query.filter_by(confirmation_number=confirmation_number).first():
            return confirmation_number
