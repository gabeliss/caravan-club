from app import app
from app.scrape_helpers.night1and2 import scrape_timberRidge
from app.scrape_helpers.night5and6api import scrape_uncleducky_api
import os, base64
from flask import request
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
    return get_price('Timber Ridge', 4, 5, scrape_timberRidge)


@app.route('/api/scrape/uncleDucky')
def get_uncleducky_price():
    return get_price('Uncle Ducky', 4, 8, scrape_uncleducky_api)