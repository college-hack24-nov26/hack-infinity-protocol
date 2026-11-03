
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///medifind.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to MediFind API",
        "status": "Backend is running"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "success",
        "message": "MediFind Backend Connected"
    })


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5000)
