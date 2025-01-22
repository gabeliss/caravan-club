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

# Database setup
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key')
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://caravan-club.onrender.com"]}})

    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database and migrations with app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints
    from app.routes import init_app
    init_app(app)

    return app

# Create the app instance
app = create_app()

# Import models only (removed routes import)
from app import models
