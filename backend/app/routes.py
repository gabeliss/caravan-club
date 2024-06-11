from app import app
from app.scrape_helpers.night1and2api import scrape_timberRidge_api, scrape_anchorInn_api, scrape_traverseCityKoa_api
from app.scrape_helpers.night3and4api import scrape_straightsKoa_api, scrape_cabinsOfMackinaw_api
from app.scrape_helpers.night5and6api import scrape_uncleducky_api
from app.payment_helpers.night5and6api_pay import pay_uncleducky_api
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


@app.route('/api/scrape/timberRidge')
def get_timberRidge_price():
    return get_price('Timber Ridge', 1, 10, scrape_timberRidge_api)


@app.route('/api/scrape/anchorInn')
def get_anchorInn_price():
    return get_price('Anchor Inn', 1, 6, scrape_anchorInn_api)


@app.route('/api/scrape/traverseCityKoa')
def get_traverseCityKoa_price():
    return get_price('Traverse City Koa', 1, 8, scrape_traverseCityKoa_api)


@app.route('/api/scrape/straightsKoa')
def get_straightsKoa_price():
    return get_price('Straights Koa', 1, 8, scrape_straightsKoa_api)


@app.route('/api/scrape/cabinsOfMackinaw')
def get_cabinsOfMackinaw_price():
    return get_price('Cabins Of Mackinaw', 1, 6, scrape_cabinsOfMackinaw_api)


@app.route('/api/scrape/uncleDucky')
def get_uncleducky_price():
    return get_price('Uncle Ducky', 1, 8, scrape_uncleducky_api)


@app.route('/api/pay/anchorInn')
def pay_anchorInn():
    result = True  # or False based on your logic
    return jsonify(success=result)


@app.route('/api/pay/cabinsOfMackinaw')
def pay_cabinsOfMackinaw():
    result = True  # or False based on your logic
    return jsonify(success=result)



@app.route('/api/pay/uncleDucky')
def pay_uncleDucky():
    num_travelers = request.args.get('numTravelers', default=1, type=int)
    start_date = request.args.get('startDate', default='', type=str)
    end_date = request.args.get('endDate', default='', type=str)
    stay_name = request.args.get('stayName', default='', type=str)
    
    payment_info = {
        "name": request.args.get('payment_info[name]', default='', type=str),
        "email": request.args.get('payment_info[email]', default='', type=str),
        "phone_number": request.args.get('payment_info[phone_number]', default='', type=str),
        "card_number": request.args.get('payment_info[card_number]', default='', type=str),
        "expiry_date": request.args.get('payment_info[expiry_date]', default='', type=str),
        "cvc": request.args.get('payment_info[cvc]', default='', type=str)
    }
    
    result = pay_uncleducky_api(num_travelers, start_date, end_date, stay_name, payment_info)
    return jsonify(success=result)