from flask import Flask
from app.routes.admin import admin_bp
from app.routes.booking import booking_bp
from app.routes.scraping import scraping_bp
from app.routes.payment import payment_bp

def init_app(app):
    app.register_blueprint(admin_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(scraping_bp)
    app.register_blueprint(payment_bp)
