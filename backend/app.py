from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/upload", methods=["POST"])
def upload():
    issue_type = request.form.get("issue_type")

    if issue_type == "pothole":
        severity = "High"
        message = "Pothole detected on road"
    elif issue_type == "streetlight":
        severity = "Medium"
        message = "Broken streetlight detected"
    else:
        severity = "Low"
        message = "Unknown issue"

    return jsonify({
        "issue": issue_type,
        "severity": severity,
        "location": "Bengaluru",
        "message": message
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

