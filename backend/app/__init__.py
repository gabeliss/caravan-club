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

# Logging configuration
logging.basicConfig(level=logging.DEBUG)

# Flask app initialization
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key')
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Database and migration setup
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models and routes
from app import models, routes
