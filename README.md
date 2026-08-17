# RoadIntel

RoadIntel is a location-aware road issue reporting platform that helps users report and visualize road problems such as potholes and broken streetlights using images and GPS location.

## Features

- Google authentication with Firebase
- Report potholes and broken streetlights
- Upload or capture images as evidence
- Automatic GPS location capture
- Interactive public issue map
- Personal report history
- SHA-256 based duplicate image detection
- Location-based duplicate report detection
- SQLite database for report storage
- Delete your own reports

## Tech Stack

### Frontend

- HTML
- CSS
- JavaScript
- Firebase Authentication
- Leaflet
- Leaflet MarkerCluster

### Backend

- Python
- Flask
- Flask-CORS
- Flask-SQLAlchemy
- SQLite

## Project Structure

```text
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
└── README.md```

---

##  Use Case

- Smart city road monitoring
- Municipal corporation reporting
- Community-driven road safety
- Infrastructure maintenance prioritization

---

##  Screenshots

### Homepage/Before Reporting Issue
![Homepage](screenshots/beforereporting.jpeg)

### After Reporting Issue
![After Reporting Issue](screenshots/afterreporting.jpeg)








