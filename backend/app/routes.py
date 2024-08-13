from app import app
from app.scrape_helpers.night1and2api import scrape_traverseCityStatePark_api, scrape_timberRidge_api, scrape_anchorInn_api, scrape_traverseCityKoa_api
from app.scrape_helpers.night3and4api import scrape_stIgnaceKoa_api, scrape_cabinsOfMackinaw_api
from app.scrape_helpers.night5and6api import scrape_uncleducky_api, scrape_picturedRocksKoa_api, scrape_fortSuperior_api, scrape_touristPark_api
from app.payment_helpers.night1and2api_pay import pay_anchorInn_api, pay_timberRidge_api, pay_traverseCityKoa_api
from app.payment_helpers.night3and4api_pay import pay_cabinsOfMackinaw_api
from app.payment_helpers.night5and6api_pay import pay_uncleducky_api, pay_fortSuperior_api, pay_touristPark_api
import os, base64
from flask import request, jsonify
import logging

@app.route('/api/hello')
def index():
    return 'Hello, World!'

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
        num_travelers = request.args.get('numTravelers', default=1, type=int)
        if num_travelers < min_travelers:
            return {"available": False, "price": None, "message": f"Not available for less than {min_travelers} travelers"}
        
        if num_travelers > max_travelers:
            return {"available": False, "price": None, "message": f"Not available for more than {max_travelers} travelers"}

        start_date = request.args.get('startDate', default='', type=str)
        end_date = request.args.get('endDate', default='', type=str)
        data = scrape_function(num_travelers, start_date, end_date)
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

#### SCRAPES ###
@app.route('/api/scrape/traverseCityStatePark')
def get_traverseCityStatePark_price():
    return get_price('Traverse City State Park', 1, 6, scrape_traverseCityStatePark_api)

@app.route('/api/scrape/timberRidge')
def get_timberRidge_price():
    return get_price('Timber Ridge', 1, 10, scrape_timberRidge_api)


@app.route('/api/scrape/anchorInn')
def get_anchorInn_price():
    return get_price('Anchor Inn', 1, 6, scrape_anchorInn_api)


@app.route('/api/scrape/traverseCityKoa')
def get_traverseCityKoa_price():
    return get_price('Traverse City Koa', 1, 8, scrape_traverseCityKoa_api)


@app.route('/api/scrape/stIgnaceKoa')
def get_stIgnaceKoa_price():
    return get_price('St Ignace Koa', 1, 8, scrape_stIgnaceKoa_api)


@app.route('/api/scrape/cabinsOfMackinaw')
def get_cabinsOfMackinaw_price():
    return get_price('Cabins Of Mackinaw', 1, 6, scrape_cabinsOfMackinaw_api)


@app.route('/api/scrape/uncleDucky')
def get_uncleducky_price():
    return get_price('Uncle Ducky', 1, 8, scrape_uncleducky_api)


@app.route('/api/scrape/picturedRocksKoa')
def get_picturedRocksKoa_price():
    return get_price('Pictured Rocks Koa', 1, 8, scrape_picturedRocksKoa_api)


@app.route('/api/scrape/fortSuperior')
def get_fortSuperior_price():
    return get_price('Fort Superior', 1, 6, scrape_fortSuperior_api)


@app.route('/api/scrape/touristPark')
def get_touristPark_price():
    return get_price('Tourist Park', 1, 6, scrape_touristPark_api)


### PAYMENTS ###

@app.route('/api/pay/timberRidge')
def pay_timberRidge():
    return process_payment(pay_timberRidge_api)

@app.route('/api/pay/anchorInn')
def pay_anchorInn():
    return process_payment(pay_anchorInn_api)


@app.route('/api/pay/traverseCityKoa')
def pay_traverseCityKoa():
    return process_payment(pay_traverseCityKoa_api)


@app.route('/api/pay/cabinsOfMackinaw')
def pay_cabinsOfMackinaw():
    return process_payment(pay_cabinsOfMackinaw_api)


@app.route('/api/pay/uncleDucky')
def pay_uncleDucky():
    return process_payment(pay_uncleducky_api)


@app.route('/api/pay/fortSuperior')
def pay_fortSuperior():
    return process_payment(pay_fortSuperior_api)


@app.route('/api/pay/touristPark')
def pay_touristPark():
    return process_payment(pay_touristPark_api)