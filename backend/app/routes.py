from app import app
from app.helpers import scrape_price

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/api/price')
def get_price():
    price = scrape_price()
    return price