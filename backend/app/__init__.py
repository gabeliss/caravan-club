import logging
import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database Config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')  # From .env
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Database and Migrations
db = SQLAlchemy(app)
migrate = Migrate(app, db)

from app import routes
