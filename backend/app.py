import uuid
import hashlib
import math
import os
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# ── Config ────────────────────────────────────────────────
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///reports.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

ISSUE_RADIUS = {
    "pothole": 100,
    "streetlight": 30
}

# ── Model ─────────────────────────────────────────────────
class Report(db.Model):
    id           = db.Column(db.String(36),  primary_key=True, default=lambda: str(uuid.uuid4()))
    issue_type   = db.Column(db.String(50),  nullable=False)
    latitude     = db.Column(db.Float,       nullable=False)
    longitude    = db.Column(db.Float,       nullable=False)
    image        = db.Column(db.String(200), nullable=False)
    image_hash   = db.Column(db.String(64),  nullable=False)
    timestamp    = db.Column(db.String(30),  nullable=False)
    user_email   = db.Column(db.String(200))
    user_uid     = db.Column(db.String(200))
    user_name    = db.Column(db.String(200))

    def to_dict(self):
        return {
            "id":         self.id,
            "issue_type": self.issue_type,
            "latitude":   self.latitude,
            "longitude":  self.longitude,
            "image":      self.image,
            "timestamp":  self.timestamp,
            "user_email": self.user_email,
            "user_uid":   self.user_uid,
            "user_name":  self.user_name,
        }

with app.app_context():
    db.create_all()

# ── Helpers ───────────────────────────────────────────────
def file_hash_and_reset(file):
    data = file.read()
    hash_value = hashlib.sha256(data).hexdigest()
    file.seek(0)
    return hash_value

def distance_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi       = math.radians(lat2 - lat1)
    dlambda    = math.radians(lon2 - lon1)
    a = (math.sin(dphi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2)
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# ── Routes ────────────────────────────────────────────────
@app.route("/reports", methods=["GET"])
def get_reports():
    reports = Report.query.order_by(Report.timestamp.desc()).all()
    return jsonify([r.to_dict() for r in reports])


@app.route("/uploads/<filename>")
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/upload", methods=["POST"])
def upload():
    issue_type = request.form.get("issue_type")
    latitude   = request.form.get("latitude")
    longitude  = request.form.get("longitude")
    user_email = request.form.get("user_email")
    user_uid   = request.form.get("user_uid")
    user_name  = request.form.get("user_name", "Unknown")
    file       = request.files.get("file")

    # Validate coordinates
    try:
        latitude  = float(latitude)
        longitude = float(longitude)
        if math.isnan(latitude) or math.isnan(longitude):
            raise ValueError()
    except Exception:
        return jsonify({"status": "error", "message": "Invalid location data"}), 400

    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    img_hash = file_hash_and_reset(file)
    radius   = ISSUE_RADIUS.get(issue_type, 50)

    # Reject duplicate image
    if Report.query.filter_by(image_hash=img_hash).first():
        return jsonify({"status": "rejected", "message": "This image has already been uploaded"}), 409

    # Reject nearby same-type report
    nearby = Report.query.filter_by(issue_type=issue_type).all()
    for r in nearby:
        if distance_m(latitude, longitude, r.latitude, r.longitude) < radius:
            return jsonify({
                "status": "rejected",
                "message": f"A {issue_type} was already reported nearby"
            }), 409

    # Save image file
    filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
    file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Save report to DB
    new_report = Report(
        id         = str(uuid.uuid4()),
        issue_type = issue_type,
        latitude   = latitude,
        longitude  = longitude,
        image      = filename,
        image_hash = img_hash,
        timestamp  = datetime.utcnow().isoformat(),
        user_email = user_email,
        user_uid   = user_uid,
        user_name  = user_name,
    )
    db.session.add(new_report)
    db.session.commit()

    return jsonify({"status": "accepted", "message": "Issue reported successfully", "issue": issue_type})


@app.route("/delete-report", methods=["POST"])
def delete_report():
    data      = request.get_json()
    report_id = data.get("report_id")
    user_uid  = data.get("user_uid")

    if not report_id or not user_uid:
        return jsonify({"message": "Missing data"}), 400

    report = Report.query.get(report_id)

    if not report:
        return jsonify({"message": "Report not found"}), 404

    if report.user_uid != user_uid:
        return jsonify({"message": "Not authorized"}), 403

    # Delete image file
    image_path = os.path.join(UPLOAD_FOLDER, report.image)
    if os.path.exists(image_path):
        os.remove(image_path)

    db.session.delete(report)
    db.session.commit()

    return jsonify({"message": "Report deleted"})


if __name__ == "__main__":
    app.run(debug=True)

