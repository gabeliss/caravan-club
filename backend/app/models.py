from app import db

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     password_hash = db.Column(db.String(128), nullable=False)

# class Trip(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
#     location = db.Column(db.String(120), nullable=False)
#     start_date = db.Column(db.Date, nullable=False)
#     end_date = db.Column(db.Date, nullable=False)
#     total_price = db.Column(db.Float, nullable=False)
#     payment_status = db.Column(db.String(50), nullable=False, default='pending')

#     user = db.relationship('User', backref=db.backref('trips', lazy=True))

# class Stay(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
#     location = db.Column(db.String(120), nullable=False)
#     price = db.Column(db.Float, nullable=False)
#     payment_status = db.Column(db.String(50), nullable=False, default='pending')

#     trip = db.relationship('Trip', backref=db.backref('stays', lazy=True))
