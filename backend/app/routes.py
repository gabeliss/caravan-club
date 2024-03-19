from app import app
from app.helpers import scrape_uncleducky
import os, base64
from flask import request

@app.route('/')
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


@app.route('/api/scrape/uncleducky')
def get_uncleducky_price():
    num_travelers = request.args.get('numTravelers', default=1, type=int)
    if num_travelers < 4:
        returnData = {"available": False, "price": None, "message": "Not available for less than 4 travelers"}
        return returnData
    
    if num_travelers > 4:
        returnData = {"available": False, "price": None, "message": "Not available for more than 8 travelers"}
        return returnData

    start_date = request.args.get('startDate', default='', type=str)
    end_date = request.args.get('endDate', default='', type=str)
    uncleDuckyData = scrape_uncleducky(num_travelers, start_date, end_date)
    return uncleDuckyData

# this is how to use in the react
#   const handleGetPrice = async () => {
#     try {
#       const response = await axios.get('http://127.0.0.1:5000/api/price');
#       setPrice(response.data);
#     } catch (error) {
#       console.error('Error fetching price:', error);
#     }
#   };