from app import app
from app.helpers import scrape_uncleducky
import os, base64

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
def get_price():
    price = scrape_uncleducky()
    return price

# this is how to use in the react
#   const handleGetPrice = async () => {
#     try {
#       const response = await axios.get('http://127.0.0.1:5000/api/price');
#       setPrice(response.data);
#     } catch (error) {
#       console.error('Error fetching price:', error);
#     }
#   };