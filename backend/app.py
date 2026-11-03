

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta, timezone

app = Flask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///medifind.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get(
    "MEDIFIND_SECRET_KEY", "dev-only-change-this-secret"
)

db = SQLAlchemy(app)


# USER DATABASE MODEL
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)


# HOME API
@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to MediFind API",
        "status": "Backend is running"
    })


# HEALTH CHECK
@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "message": "MediFind Backend Connected"
    })


# USER SIGNUP
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if "@" not in email:
        return jsonify({"message": "Enter a valid email address"}), 400

    if len(password) < 8:
        return jsonify({
            "message": "Password must contain at least 8 characters"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"message": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name,
        email=email,
        password_hash=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Account created successfully"
    }), 201


# USER LOGIN
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password"}), 401

    token = jwt.encode({
        "user_id": user.id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }, app.config["SECRET_KEY"], algorithm="HS256")

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5000)
