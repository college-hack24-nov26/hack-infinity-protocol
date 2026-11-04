from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
import jwt
import os

# -------------------------------
# FLASK APP CONFIGURATION
# -------------------------------

app = Flask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///medifind.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["SECRET_KEY"] = os.environ.get(
    "SECRET_KEY", "medifind-development-secret-change-this"
)

db = SQLAlchemy(app)


# -------------------------------
# DATABASE MODEL
# -------------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


# -------------------------------
# HOME / HEALTH CHECK
# -------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Welcome to MediFind Backend!",
        "status": "Running"
    })


# -------------------------------
# USER REGISTRATION
# -------------------------------

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "message": "Please fill all fields."
        }), 400

    if len(password) < 6:
        return jsonify({
            "message": "Password must contain at least 6 characters."
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered."
        }), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Registration successful!",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }), 201


# -------------------------------
# USER LOGIN
# -------------------------------

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "message": "Please enter email and password."
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({
            "message": "Invalid email or password."
        }), 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200


# -------------------------------
# AI HEALTH ASSISTANT
# GENERAL HEALTH INFORMATION ONLY
# -------------------------------

@app.route("/api/assistant", methods=["POST"])
def assistant():

    data = request.get_json(silent=True) or {}

    question = data.get("question", "").strip().lower()

    if not question:
        return jsonify({
            "answer": "Please enter your question."
        }), 400

    # GREETING
    if any(word in question for word in ["hello", "hi", "hey"]):

        answer = (
            "Hello! Welcome to MediFind Health Assistant. "
            "I can help you understand general health information. "
            "What would you like to know?"
        )

    # HEART HEALTH
    elif any(word in question for word in [
        "heart", "cardiac", "heart patient"
    ]):

        answer = (
            "Heart health is important for overall well-being. "
            "The heart pumps blood throughout the body. "
            "Different heart conditions require different care. "
            "For personal advice, please consult a cardiologist. "
            "If you experience chest pain, severe breathlessness, "
            "fainting, or sudden serious symptoms, seek emergency "
            "medical help."
        )

    # DIABETES
    elif "diabetes" in question or "sugar" in question:

        answer = (
            "Diabetes is a condition in which blood glucose levels "
            "are higher than normal. Common types include Type 1 "
            "and Type 2 diabetes. Healthcare professionals use "
            "blood tests to assess blood glucose levels and guide care."
        )

    # BLOOD PRESSURE
    elif "blood pressure" in question or " bp " in f" {question} ":

        answer = (
            "Blood pressure is the force of blood against the walls "
            "of your arteries. It is usually recorded using two "
            "numbers: systolic and diastolic pressure. A healthcare "
            "professional can help interpret your readings."
        )

    # NUTRITION
    elif any(word in question for word in [
        "diet", "food", "nutrition", "healthy eating"
    ]):

        answer = (
            "General healthy eating includes a variety of fruits, "
            "vegetables, whole grains and suitable protein sources. "
            "Individual nutritional needs can vary, especially when "
            "someone has a health condition. A qualified healthcare "
            "professional can provide personal guidance."
        )

    # SLEEP
    elif "sleep" in question:

        answer = (
            "Sleep supports physical and mental health. "
            "A regular sleep schedule, a comfortable sleeping "
            "environment and a consistent bedtime can support "
            "healthy sleep habits."
        )

    # EXERCISE
    elif any(word in question for word in [
        "exercise", "fitness", "physical activity"
    ]):

        answer = (
            "Physical activity can support general health. "
            "The appropriate activity depends on a person's age "
            "and health condition. People with heart conditions "
            "should ask their healthcare professional before "
            "starting or changing an exercise routine."
        )

    # WATER
    elif any(word in question for word in [
        "water", "hydration", "dehydration"
    ]):

        answer = (
            "Water helps the body regulate temperature and supports "
            "normal body functions. Hydration needs vary depending "
            "on age, activity, climate and health conditions."
        )

    # FEVER
    elif "fever" in question:

        answer = (
            "Fever is a temporary rise in body temperature and can "
            "occur when the body responds to an infection or illness. "
            "A healthcare professional can help assess persistent "
            "or concerning fever, especially when other serious "
            "symptoms are present."
        )

    # HEADACHE
    elif "headache" in question:

        answer = (
            "A headache is pain or discomfort in the head. "
            "There are different possible causes. Sudden severe "
            "headache or headache with confusion, weakness or "
            "other serious symptoms needs urgent medical assessment."
        )

    # DEFAULT RESPONSE
    else:

        answer = (
            "Thank you for your question! I can currently provide "
            "basic general information about heart health, diabetes, "
            "blood pressure, nutrition, sleep, exercise, water and "
            "fever. For other questions, please consult a trusted "
            "healthcare professional."
        )

    return jsonify({
        "answer": answer
    }), 200


# -------------------------------
# DATABASE INITIALIZATION
# -------------------------------

with app.app_context():
    db.create_all()


# -------------------------------
# RUN SERVER
# -------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )