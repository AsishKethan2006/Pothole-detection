RoadIntel

RoadIntel is a location-aware road issue reporting platform that allows users to report road problems such as potholes and broken streetlights using images and GPS location.

Features
Google authentication using Firebase
Report potholes and broken streetlights
Upload or capture images as evidence
Automatic GPS location capture
Interactive public issue map
Personal report history
Duplicate image detection using SHA-256
Nearby duplicate issue detection
SQLite database for storing reports
Delete your own reports
Tech Stack
Frontend
HTML
CSS
JavaScript
Firebase Authentication
Leaflet
Leaflet MarkerCluster
Backend
Python
Flask
Flask-CORS
Flask-SQLAlchemy
SQLite
Project Structure
RoadIntel/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .gitignore
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── screenshots/
└── README.md

How It Works
Sign in using Google authentication.
Select the type of road issue.
Upload or capture an image.
Allow location access to capture the GPS coordinates.
Submit the report.
The backend validates the report and checks for duplicates.
Valid reports are stored in the database and displayed on the public map.
Duplicate Detection

RoadIntel uses two methods to reduce duplicate reports:

Image duplication: Uploaded images are hashed using SHA-256. The same image cannot be submitted more than once.
Location duplication: Reports of the same issue type within a defined geographic distance are treated as duplicates.

The current duplicate detection thresholds are:

Issue	Distance
Pothole	100 meters
Broken Streetlight	30 meters
API Endpoints
GET /reports

Returns the road issue reports stored in the database.

POST /upload

Creates a new road issue report.

The request includes the issue type, image, latitude, longitude, and user information.

GET /uploads/<filename>

Returns an uploaded report image.

POST /delete-report

Deletes a report belonging to the authenticated user.

Running Locally
1. Clone the Repository
git clone https://github.com/AsishKethan2006/RoadIntel.git
cd RoadIntel

2. Install Backend Dependencies
cd backend
pip install -r requirements.txt

3. Start the Backend
python app.py


The backend runs locally on:

http://127.0.0.1:5000

4. Start the Frontend

Open frontend/index.html in a browser, or serve the frontend using a local HTTP server.

For example:

cd frontend
python -m http.server 5500


Then open:

http://127.0.0.1:5500

Firebase Configuration

RoadIntel uses Firebase Authentication for Google sign-in.

Before running the application, configure a Firebase project and enable Google authentication.

For production use, Firebase configuration and authentication should be properly secured and restricted to the required domains.

Current Limitations

RoadIntel is currently a prototype.

The current implementation does not include a computer-vision model for automatically detecting road issues or predicting their severity. Users manually select the issue type when submitting a report.

The application currently uses SQLite and local file storage, which are suitable for development and prototyping but should be replaced with production-ready infrastructure for large-scale deployment.

Future Improvements
AI-based road issue detection
Automatic severity classification
Report verification
Authority/admin dashboard
Issue status tracking
Maintenance assignment
Notifications
Advanced analytics and heatmaps
Production database and cloud storage
Stronger backend authentication and authorization
Project Status

RoadIntel is an ongoing project focused on making road issue reporting more accessible, location-aware, and organized.

The current version provides the core reporting, validation, storage, and map visualization functionality needed to build a larger road monitoring platform.

License

No open-source license has currently been specified for this project.
##  Use Case

- Smart city road monitoring
- Municipal corporation reporting
- Community-driven road safety
- Infrastructure maintenance prioritization

---

## API Keys & Security

Google Maps API keys are required for map rendering.  
 **Do not expose API keys in production environments.**

---

##  Screenshots

### Homepage/Before Reporting Issue
![Homepage](screenshots/beforereporting.jpeg)

### After Reporting Issue
![After Reporting Issue](screenshots/afterreporting.jpeg)





##  Future Enhancements

- AI model for real-time pothole detection
- User authentication
- Admin dashboard for authorities
- Issue status tracking
- Heatmap visualization of road issues


