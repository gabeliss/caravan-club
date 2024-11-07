from app import app
from app.scrape_helpers.northernMichigan.traverseCity.tent.scrapeTimberRidgeTent import scrape_timberRidgeTent
from app.scrape_helpers.northernMichigan.traverseCity.tent.scrapeLeelanauPinesTent import scrape_leelanauPinesTent
from app.scrape_helpers.northernMichigan.mackinacCity.tent.scrapeIndianRiverTent import scrape_indianRiverTent
from app.scrape_helpers.northernMichigan.mackinacCity.tent.scrapeTeePeeCampgroundTent import scrape_teePeeCampgroundTent
from app.scrape_helpers.northernMichigan.picturedRocks.tent.scrapeUncleDuckysTent import scrape_uncleDuckysTent
from app.scrape_helpers.northernMichigan.picturedRocks.tent.scrapeTouristParkTent import scrape_touristParkTent
from app.scrape_helpers.northernMichigan.picturedRocks.tent.scrapeFortSuperiorTent import scrape_fortSuperiorTent
import os, base64
from flask import request, jsonify
import logging

@app.route('/api/hello')
def index():
    return 'Hello, World - modified!'

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
    logging.info(f"{place_name} Request Args: %s", request.args)
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
        logging.info('get_price return value', data)
        return data
    except Exception as e:
        logging.error(f"Error in {place_name}: %s", str(e), exc_info=True)
        return {"error": "Internal server error"}, 500
    

def process_payment(api_function):
    num_travelers = request.args.get('numTravelers', default=1, type=int)
    start_date = request.args.get('startDate', default='', type=str)
    end_date = request.args.get('endDate', default='', type=str)
    stay_name = request.args.get('stayName', default='', type=str)
    
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
    
    result = api_function(num_travelers, start_date, end_date, stay_name, payment_info)
    return jsonify(success=result)


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

@app.route('/api/scrape/teePeeCampgroundTent')
def get_teePeeCampgroundTent_price():
    return get_price('Tee Pee Campground', 1, 6, scrape_teePeeCampgroundTent)

@app.route('/api/scrape/uncleDuckysTent')
def get_uncleDuckysTent_price():
    return get_price('Uncle Duckys', 1, 5, scrape_uncleDuckysTent)

@app.route('/api/scrape/touristParkTent')
def get_touristParkTent_price():
    return get_price('Tourist Park', 1, 6, scrape_touristParkTent)

@app.route('/api/scrape/fortSuperiorTent')
def get_fortSuperiorTent_price():
    return get_price('Fort Superior', 1, 6, scrape_fortSuperiorTent)